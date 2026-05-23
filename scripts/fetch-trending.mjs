#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TRENDING_URL = 'https://api.github.com/search/repositories?q=topic:ai+topic:machine-learning+topic:deep-learning&sort=stars&order=desc&per_page=30';

function readExistingData(dataPath) {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}

async function fetchTrendingRepos() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(TRENDING_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AI-News-Hub/1.0', Accept: 'application/vnd.github.v3+json' },
    });

    if (!res.ok) {
      console.error(`  ✗ GitHub API: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.items || []).slice(0, 20).map((repo) => {
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
    });
  } catch (err) {
    console.error(`  ✗ GitHub API: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  console.log('Fetching GitHub trending AI repos...');

  const repos = await fetchTrendingRepos();
  if (repos.length === 0) {
    console.log('No repos fetched, leaving existing data intact.');
    return;
  }

  console.log(`  ✓ GitHub Trending: ${repos.length} repos`);

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
  const existing = readExistingData(dataPath);
  const map = new Map();
  for (const item of existing) map.set(item.url, item);
  for (const repo of repos) map.set(repo.url, repo);

  const merged = [...map.values()]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: merged ${repos.length} repos, ${merged.length} total items`);
}

main().catch(console.error);
