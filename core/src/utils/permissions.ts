import { createAccessControl, type AccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/organization/access';

/**
 * Define custom permissions for the application
 * Using `as const` for proper TypeScript type inference
 *
 * Simplified permissions:
 * - 'read': View access to the resource
 * - 'manage': Full CRUD operations (create, update, delete)
 */
export const statement = {
  ...defaultStatements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'manage'],
  results: ['read', 'manage'],
  events: ['manage'],
} as const;

// Create access control instance
export const ac = createAccessControl(statement) as AccessControl;

/**
 * Type definitions for permission checking
 */
export type PermissionResource = keyof typeof statement;
export type PermissionAction<T extends PermissionResource> = (typeof statement)[T][number];

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
export const owner = ac.newRole({
  ...adminAc.statements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'manage'],
  results: ['read', 'manage'],
  events: ['manage'],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  competitions: ['read', 'update'],
  inscriptions: ['read', 'manage'],
  results: ['read', 'manage'],
  events: ['manage'],
});

export const resultManager = ac.newRole({
  competitions: ['read'],
  inscriptions: ['read'],
  results: ['read', 'manage'],
  events: ['read'],
});
