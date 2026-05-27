#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'football.json');

const STANDINGS_URL = 'https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings';
const SCHEDULE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/360/schedule';

async function fetchStandings() {
  const res = await fetch(STANDINGS_URL, {
    headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Standings HTTP ${res.status}`);
  const data = await res.json();

  const entries = data?.children?.[0]?.standings?.entries || [];
  return entries.map((e, i) => {
    const stats = {};
    for (const s of e.stats || []) {
      stats[s.name] = s.value;
    }
    return {
      position: i + 1,
      teamId: e.team?.id || '',
      teamName: e.team?.displayName || '',
      teamAbbrev: e.team?.abbreviation || '',
      gamesPlayed: stats.gamesPlayed || 0,
      wins: stats.wins || 0,
      draws: stats.ties || 0,
      losses: stats.losses || 0,
      goalsFor: stats.pointsFor || 0,
      goalsAgainst: stats.pointsAgainst || 0,
      goalDifference: stats.pointDifferential || 0,
      points: stats.points || 0,
      note: e.note?.description || '',
      noteColor: e.note?.color || '',
    };
  });
}

async function fetchSchedule() {
  const res = await fetch(SCHEDULE_URL, {
    headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Schedule HTTP ${res.status}`);
  const data = await res.json();

  const now = Date.now();
  let lastMatch = null;
  let nextMatch = null;

  for (const e of data?.events || []) {
    const comp = e.competitions?.[0];
    if (!comp) continue;

    const matchDate = new Date(e.date).getTime();
    const away = comp.competitors?.[0];
    const home = comp.competitors?.[1];
    if (!away || !home) continue;

    const isHome = home.team?.id === '360';
    const match = {
      date: e.date,
      homeTeam: home.team?.displayName || '',
      awayTeam: away.team?.displayName || '',
      homeScore: home.score?.value !== undefined ? Number(home.score.value) : undefined,
      awayScore: away.score?.value !== undefined ? Number(away.score.value) : undefined,
      status: comp.status?.type?.description || '',
      isHome,
    };

    const statusType = comp.status?.type?.state || '';
    if (statusType === 'post' || matchDate < now) {
      if (!lastMatch || matchDate > new Date(lastMatch.date).getTime()) {
        lastMatch = match;
      }
    } else {
      if (!nextMatch || matchDate < new Date(nextMatch.date).getTime()) {
        nextMatch = match;
      }
    }
  }

  return { lastMatch, nextMatch };
}

async function main() {
  console.log('Fetching football data...');
  try {
    const [standings, schedule] = await Promise.all([fetchStandings(), fetchSchedule()]);

    const output = {
      fetchedAt: new Date().toISOString(),
      standings,
      lastMatch: schedule.lastMatch || null,
      nextMatch: schedule.nextMatch || null,
    };

    fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`  ✓ ${standings.length} teams, last match: ${schedule.lastMatch?.status || 'none'}, next: ${schedule.nextMatch?.status || 'none'}`);
  } catch (err) {
    console.error('  ✗ Football fetch failed:', err.message);
    // Keep existing data if fetch fails
    if (fs.existsSync(dataPath)) {
      console.log('  Keeping existing football data.');
    }
  }
}

main().catch(console.error);
