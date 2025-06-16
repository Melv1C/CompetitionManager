import { describe, it, expect } from 'vitest';
import { ac, admin, user } from '@/utils/permissions';

describe('permissions', () => {
  it('admin role should allow cleanup logs', () => {
    const result = admin.authorize({ logs: ['cleanup'] });
    expect(result.success).toBe(true);
  });

  it('user role should not allow cleanup logs', () => {
    // TypeScript workaround: cast to any to test denied permission for logs
    const result = user.authorize({ logs: ['cleanup'] } as any);
    expect(result.success).toBe(false);
  });

  it('access control should expose statements', () => {
    expect(ac.statements.logs).toContain('cleanup');
  });
});
