import {
  createAccessControl,
  type AccessControl,
} from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Define custom permissions for the application
 * Using `as const` for proper TypeScript type inference
 */
export const statement = {
  ...defaultStatements,
  logs: ['read', 'cleanup'],
  competitions: ['read'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read'],
} as const;

// Create access control instance
export const ac = createAccessControl(statement) as AccessControl;

/**
 * Type definitions for permission checking
 */
export type PermissionResource = keyof typeof statement;
export type PermissionAction<T extends PermissionResource> =
  (typeof statement)[T][number];

/**
 * Strongly typed permission check structure
 * Each key must be a valid resource from the statement
 * Each value must be an array of valid actions for that resource
 */
export type PermissionCheck = {
  [K in PermissionResource]?: PermissionAction<K>[];
};

/**
 * Define roles with specific permissions
 */
export const admin = ac.newRole({
  ...adminAc.statements,
  logs: ['read', 'cleanup'],
  competitions: ['read'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read'],
});

export const user = ac.newRole({
  competitions: ['read'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read'],
});