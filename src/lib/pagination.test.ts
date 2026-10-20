import { describe, expect, it } from 'vitest';
import { pageCount, pageWindow, parsePage } from './pagination';

describe('parsePage', () => {
  it('accepts positive integers', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage(['2', '9'])).toBe(2);
  });

  it('falls back to page 1 for anything else', () => {
    for (const value of [undefined, '', '0', '-2', '1.5', 'abc', '2abc']) {
      expect(parsePage(value)).toBe(1);
    }
  });
});

describe('pageCount', () => {
  it('always has at least one page', () => {
    expect(pageCount(0, 12)).toBe(1);
    expect(pageCount(12, 12)).toBe(1);
    expect(pageCount(13, 12)).toBe(2);
  });
});

describe('pageWindow', () => {
  it('shows every page when there are few', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses distant pages into gaps', () => {
    expect(pageWindow(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
    expect(pageWindow(1, 12)).toEqual([1, 2, 'gap', 12]);
  });
});
