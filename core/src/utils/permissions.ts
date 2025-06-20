import {
  createAccessControl,
  type AccessControl,
} from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/organization/access';

/**
 * Define custom permissions for the application
 * Using `as const` for proper TypeScript type inference
 */
export const statement = {
  ...defaultStatements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
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
export const owner = ac.newRole({
  ...adminAc.statements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  competitions: ['read', 'create', 'update'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
});

export const resultManager = ac.newRole({
  results: ['read', 'create', 'update', 'delete'],
  competitions: ['read'],
  inscriptions: ['read'],
});