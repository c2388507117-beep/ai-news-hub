#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TWO_YEARS_AGO = new Date();
TWO_YEARS_AGO.setFullYear(TWO_YEARS_AGO.getFullYear() - 2);
const DATE_FILTER = 'created:>=' + TWO_YEARS_AGO.toISOString().slice(0, 10);

// Search queries that return popular AI/ML repos
const SEARCH_QUERIES = [
  `ai OR artificial-intelligence OR machine-learning ${DATE_FILTER} stars:>500`,
  `llm OR large-language-model OR gpt ${DATE_FILTER} stars:>500`,
  `deep-learning OR neural-network OR pytorch ${DATE_FILTER} stars:>500`,
  `computer-vision OR nlp OR recommender-system ${DATE_FILTER} stars:>300`,
  `ai-agents OR autonomous-ai OR rag ${DATE_FILTER} stars:>300`,
];

const PER_PAGE = 30;
const MAX_REPOS = 40;

function readExistingData(dataPath) {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}

async function fetchFromGitHub(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${PER_PAGE}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AI-News-Hub/1.0', Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) {
      console.error(`  ✗ GitHub API (${res.status}): ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(`  ✗ GitHub API: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFromMirror(query) {
  // Fallback: use GitHub API via ghproxy (accessible from China)
  const url = `https://ghproxy.net/https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${PER_PAGE}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AI-News-Hub/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.items || [];
  } catch {
    return null;
  }
}

async function fetchRepos(query) {
  // Try direct GitHub API first, then mirror
  let repos = await fetchFromGitHub(query);
  if (repos === null) {
    console.log('  Trying mirror fallback...');
    repos = await fetchFromMirror(query);
  }
  if (repos === null) {
    console.error(`  ✗ All sources failed for query`);
    return [];
  }
  // Filter to ensure only recent repos
  const cutoff = TWO_YEARS_AGO.getTime();
  repos = repos.filter((repo) => {
    const created = new Date(repo.created_at).getTime();
    return !isNaN(created) && created >= cutoff;
  });
  console.log(`  ✓ ${repos.length} repos (query: ${query.slice(0, 60)}...)`);
  return repos;
}

function repoToNewsItem(repo) {
  let publishedAt = repo.created_at;
  if (!publishedAt || isNaN(new Date(publishedAt).getTime())) {
    publishedAt = new Date().toISOString();
  }
  return {
    id: `gh-${repo.id}`,
    title: `${repo.full_name}: ${repo.description || ''}`.slice(0, 200),
    url: repo.html_url,
    summary: repo.description || repo.full_name,
    source: 'GitHub',
    category: 'trending',
    publishedAt,
    imageUrl: repo.owner?.avatar_url,
    type: 'repo',
    stars: repo.stargazers_count,
    language: repo.language || 'Unknown',
  };
}

async function main() {
  console.log('Fetching GitHub trending AI repos (last 2 years)...');

  // Fetch all queries in parallel
  const results = await Promise.allSettled(SEARCH_QUERIES.map(fetchRepos));
  const allRepos = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  if (allRepos.length === 0) {
    console.log('No repos fetched, leaving existing data intact.');
    return;
  }

  // Deduplicate by repo id
  const seen = new Set();
  const unique = allRepos.filter((repo) => {
    if (seen.has(repo.id)) return false;
    seen.add(repo.id);
    return true;
  });

  // Sort by stars descending and take top MAX_REPOS
  unique.sort((a, b) => b.stargazers_count - a.stargazers_count);
  const top = unique.slice(0, MAX_REPOS);

  console.log(`  ✓ GitHub Trending: ${top.length} repos (from ${unique.length} unique across ${SEARCH_QUERIES.length} queries)`);

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
  const existing = readExistingData(dataPath);

  // Re-categorize existing items
  const migrated = existing.map((item) => {
    if (item.category === 'research' || item.category === 'industry') {
      return { ...item, category: 'tech' };
    }
    return item;
  });

  // Merge: replace all existing trending repos with fresh ones, keep other categories
  const nonTrending = migrated.filter((item) => item.category !== 'trending');
  const trendingItems = top.map(repoToNewsItem);
  const merged = [...nonTrending, ...trendingItems]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${trendingItems.length} trending repos, ${merged.length} total items`);
}

main().catch(console.error);
