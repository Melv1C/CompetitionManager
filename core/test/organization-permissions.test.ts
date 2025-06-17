import { admin, owner, resultManager } from '@/utils/permissions';
import { describe, expect, it } from 'vitest';

describe('organization permissions', () => {
  it('owner should allow deleting competitions', () => {
    const result = owner.authorize({ competitions: ['delete'] });
    expect(result.success).toBe(true);
  });

  it('organizationAdmin should not allow deleting competitions', () => {
    const result = admin.authorize({ competitions: ['delete'] });
    expect(result.success).toBe(false);
  });

  it('resultManager should allow read results', () => {
    const result = resultManager.authorize({ results: ['read'] });
    expect(result.success).toBe(true);
  });
});
