import { describe, it, expect } from 'vitest';
import { owner, organizationAdmin, resultManager } from '../src/utils/organization-permissions';

describe('organization permissions', () => {
  it('owner should allow deleting competitions', () => {
    const result = owner.authorize({ competitions: ['delete'] });
    expect(result.success).toBe(true);
  });

  it('organizationAdmin should not allow deleting competitions', () => {
    const result = organizationAdmin.authorize({ competitions: ['delete'] });
    expect(result.success).toBe(false);
  });

  it('resultManager should allow read results', () => {
    const result = resultManager.authorize({ results: ['read'] });
    expect(result.success).toBe(true);
  });
});
