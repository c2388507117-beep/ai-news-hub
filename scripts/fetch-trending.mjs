#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Multiple broad queries to cover more AI/ML topics
const SEARCH_QUERIES = [
  'topic:ai OR topic:artificial-intelligence OR topic:machine-learning',
  'topic:deep-learning OR topic:llm OR topic:large-language-model OR topic:generative-ai',
  'topic:computer-vision OR topic:nlp OR topic:natural-language-processing',
  'topic:reinforcement-learning OR topic:robotics OR topic:ai-agents OR topic:mlops',
];

const PER_PAGE = 50;
const MAX_REPOS = 40;

function readExistingData(dataPath) {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}

async function fetchRepos(query) {
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
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(`  ✗ GitHub API: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
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
  console.log('Fetching GitHub trending AI repos...');

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

  // Merge: replace all existing trending repos with fresh ones, keep other categories
  const nonTrending = existing.filter((item) => item.category !== 'trending');
  const trendingItems = top.map(repoToNewsItem);
  const merged = [...nonTrending, ...trendingItems]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${trendingItems.length} trending repos, ${merged.length} total items`);
}

main().catch(console.error);
