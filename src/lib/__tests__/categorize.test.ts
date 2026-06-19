import { describe, it, expect } from 'vitest';
import { autoCategorize, cleanContent, extractKeywords } from '../categorize';

describe('autoCategorize', () => {
  it('classifies AI articles', () => {
    expect(autoCategorize('OpenAI releases GPT-5 with breakthrough reasoning', 'New model details...')).toBe('ai');
    expect(autoCategorize('DeepSeek 发布新模型，推理能力大幅提升', '大模型领域再迎新突破')).toBe('ai');
  });

  it('classifies tech articles', () => {
    expect(autoCategorize('Apple launches new iPhone with 5G chip', 'Specs and pricing...')).toBe('tech');
    expect(autoCategorize('华为发布新款 MateBook 笔记本', '搭载最新处理器')).toBe('tech');
  });

  it('classifies business articles', () => {
    expect(autoCategorize('Startup raises $100M in Series B funding', 'IPO plans...')).toBe('business');
    expect(autoCategorize('某公司成功上市，市值突破千亿', '融资规模超预期')).toBe('business');
  });

  it('falls back to default category when no keywords match', () => {
    expect(autoCategorize('Something completely unrelated', 'No keywords here')).toBe('tech');
  });

  it('uses provided default category', () => {
    expect(autoCategorize('Unknown topic', 'Still no match', 'gaming')).toBe('gaming');
  });

  it('prefers AI when both AI and tech keywords present', () => {
    // "chip" is tech, but "machine learning" is AI — AI should win (more specific)
    const result = autoCategorize('New chip design for machine learning', 'Details...');
    expect(result).toBe('ai');
  });
});

describe('cleanContent', () => {
  it('removes login prompts', () => {
    expect(cleanContent('Some content. 登录注册免费阅读全文。More content.')).toBe('Some content. More content.');
  });

  it('removes email addresses', () => {
    expect(cleanContent('Contact: test@example.com for info')).toBe('Contact:  for info');
  });

  it('removes copyright notices', () => {
    expect(cleanContent('Content here. Copyright 2024 All Rights Reserved. End.')).toBe('Content here.  End.');
  });

  it('collapses excessive newlines', () => {
    expect(cleanContent('Line 1\n\n\n\nLine 2')).toBe('Line 1\n\nLine 2');
  });

  it('handles empty input', () => {
    expect(cleanContent('')).toBe('');
  });
});

describe('extractKeywords', () => {
  it('extracts English keywords of length >= 3', () => {
    const result = extractKeywords('AI and machine learning advances');
    expect(result).toContain('machine');
    expect(result).toContain('learning');
    expect(result).toContain('advances');
    // 'AI' is length 2, should not appear
    expect(result).not.toContain('ai');
    // 'and' is a common word, should not appear
    expect(result).not.toContain('and');
  });

  it('extracts Chinese bigrams', () => {
    const result = extractKeywords('人工智能发展迅速');
    expect(result).toContain('人工');
    expect(result).toContain('工智');
    expect(result).toContain('智能');
    expect(result).toContain('发展');
    expect(result).toContain('展迅');
    expect(result).toContain('迅速');
  });

  it('returns empty array for empty input', () => {
    expect(extractKeywords('')).toEqual([]);
  });

  it('deduplicates keywords', () => {
    const result = extractKeywords('machine learning machine learning');
    const mlCount = result.filter((k) => k === 'machine').length;
    expect(mlCount).toBe(1);
  });
});
