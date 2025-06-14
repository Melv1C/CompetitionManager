import {
  createAccessControl,
  type AccessControl,
} from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/organization/access';

/**
 * Define custom permissions for the application
 * Using `as const` for proper TypeScript type inference
 */
export const organizationStatement = {
  ...defaultStatements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
} as const;

// Create access control instance
export const organizationAc = createAccessControl(organizationStatement) as AccessControl;

/**
 * Type definitions for permission checking
 */
export type OrganizationPermissionResource = keyof typeof organizationStatement;
export type OrganizationPermissionAction<T extends OrganizationPermissionResource> =
  (typeof organizationStatement)[T][number];

/**
 * Strongly typed permission check structure
 * Each key must be a valid resource from the statement
 * Each value must be an array of valid actions for that resource
 */
export type OrganizationPermissionCheck = {
  [K in OrganizationPermissionResource]?: OrganizationPermissionAction<K>[];
};

/**
 * Define roles with specific permissions
 */
export const owner = organizationAc.newRole({
  ...adminAc.statements,
  competitions: ['read', 'create', 'update', 'delete'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
});

export const organizationAdmin = organizationAc.newRole({
  ...adminAc.statements,
  competitions: ['read', 'create', 'update'],
  inscriptions: ['read', 'create', 'update', 'delete'],
  results: ['read', 'create', 'update', 'delete'],
});

export const resultManager = organizationAc.newRole({
  results: ['read', 'create', 'update', 'delete'],
  competitions: ['read'],
  inscriptions: ['read'],
});