import { describe, expect, it } from 'vitest';
import { CompetitionUpdate$ } from '@/schemas';

describe('CompetitionUpdate schema', () => {
  it('accepts freeClubIds and allowedClubIds', () => {
    const parsed = CompetitionUpdate$.parse({
      name: 'Test',
      freeClubIds: [1, 2],
      allowedClubIds: [3],
    });
    expect(parsed.freeClubIds).toEqual([1, 2]);
    expect(parsed.allowedClubIds).toEqual([3]);
  });
});
