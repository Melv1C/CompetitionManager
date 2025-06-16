import { describe, it, expect } from 'vitest';
import { BetterAuthId$, Gender$ } from '../src/schemas';

describe('base schemas', () => {
  it('validates BetterAuthId format', () => {
    expect(() => BetterAuthId$.parse('12345678901234567890123456789012')).not.toThrow();
    expect(() => BetterAuthId$.parse('short')).toThrow();
  });

  it('validates Gender values', () => {
    expect(Gender$.parse('M')).toBe('M');
    expect(() => Gender$.parse('X')).toThrow();
  });
});
