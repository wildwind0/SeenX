import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatMetricNumber, formatDuration } from '../src/utils/formatters';

describe('Formatters', () => {
  it('formats metric numbers accurately', () => {
    expect(formatMetricNumber(500)).toBe('500');
    expect(formatMetricNumber(1200)).toBe('1.2K');
    expect(formatMetricNumber(25000)).toBe('25K');
    expect(formatMetricNumber(3400000)).toBe('3.4M');
  });

  it('formats video duration', () => {
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(9000)).toBe('0:09');
    expect(formatDuration(125000)).toBe('2:05');
  });

  it('formats relative times in Chinese', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10000, 'zh')).toBe('刚刚');
    expect(formatRelativeTime(now - 5 * 60 * 1000, 'zh')).toBe('5 分钟前');
    expect(formatRelativeTime(now - 2 * 3600 * 1000, 'zh')).toBe('2 小时前');
    expect(formatRelativeTime(now - 25 * 3600 * 1000, 'zh')).toBe('昨天');
  });

  it('formats relative times in English', () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10000, 'en')).toBe('Just now');
    expect(formatRelativeTime(now - 5 * 60 * 1000, 'en')).toBe('5m ago');
    expect(formatRelativeTime(now - 2 * 3600 * 1000, 'en')).toBe('2h ago');
    expect(formatRelativeTime(now - 25 * 3600 * 1000, 'en')).toBe('Yesterday');
    expect(formatRelativeTime(now - 3 * 24 * 3600 * 1000, 'en')).toBe('3d ago');
  });
});
