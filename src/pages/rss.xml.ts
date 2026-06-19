import type { APIRoute } from 'astro';
import type { NewsItem } from '../lib/types';
import fs from 'node:fs';
import path from 'node:path';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(s: string): string {
  const escaped = s.replace(/]]>/g, ']]]]><![CDATA[>');
  return `<![CDATA[${escaped}]]>`;
}

function formatPubDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export const GET: APIRoute = async () => {
  let allNews: NewsItem[] = [];
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'news.json');
    allNews = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    // news.json not available — return empty feed
  }

  const items = allNews.slice(0, 50).map(
    (item) => `
    <item>
      <title>${cdata(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description>${cdata(item.summary)}</description>
      <pubDate>${formatPubDate(item.publishedAt)}</pubDate>
      <source>${escapeXml(item.source)}</source>
      <category>${escapeXml(item.category)}</category>
    </item>`
  );

  const siteUrl = 'https://ai-news-hub.pages.dev';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI News Hub</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>每日 AI 新闻聚合 - 研究突破、行业动态、热门项目、游戏资讯</description>
    <language>zh-CN</language>
    <atom:link href="${escapeXml(siteUrl)}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
