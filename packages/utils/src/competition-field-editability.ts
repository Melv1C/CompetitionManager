import type { Competition } from './schemas';

export type FieldEditabilityRule =
  | 'always'
  | 'locked-after-publish'
  | 'locked-after-inscription-start'
  | 'locked-after-competition-start';

export interface FieldEditabilityInfo {
  isEditable: boolean;
  rule: FieldEditabilityRule;
  reason?: string;
}

export interface FieldEditabilityOptions {
  /** When true, bypasses all locking rules (for admin users) */
  isAdmin?: boolean;
}

/**
 * Field editability rules based on competition state.
 * Defines when each field can be modified based on the competition lifecycle.
 *
 * Important: Rules "locked-after-inscription-start" and "locked-after-competition-start"
 * only apply if the competition is published. Unpublished competitions can modify all fields
 * except those marked as "locked-after-publish".
 */
const FIELD_RULES: Record<string, FieldEditabilityRule> = {
  // Always editable - These fields can be changed at any time
  location: 'always',
  contactPhone: 'always',
  contactEmail: 'always',
  isInscriptionVisible: 'always',
  allowedClubIds: 'always',
  description: 'always',

  // Locked after publish - These fields become immutable once the competition is published
  isPublished: 'locked-after-publish',
  name: 'locked-after-publish',
  startDate: 'locked-after-publish',
  endDate: 'locked-after-publish',

  // Locked after inscription start - These fields cannot be changed once registration opens
  inscriptionStartDate: 'locked-after-inscription-start',
  bibStartNumber: 'locked-after-inscription-start',
  freeClubIds: 'locked-after-inscription-start',
  maxEventPerAthlete: 'locked-after-inscription-start',
  bibPermissions: 'locked-after-inscription-start',
  isPaidOnline: 'locked-after-inscription-start',
  isSelection: 'locked-after-inscription-start',
  recordsFromDate: 'locked-after-inscription-start',

  // Locked after competition start - These fields can be changed until the competition begins
  inscriptionEndDate: 'locked-after-competition-start',
  hasConfirmation: 'locked-after-competition-start',
  confirmationDeadlineMinutes: 'locked-after-competition-start',
};

/**
 * Determines if a field is editable based on the competition state.
 *
 * The locking logic works as follows:
 * - 'always': Field is always editable regardless of competition state
 * - 'locked-after-publish': Field becomes locked once competition is published
 * - 'locked-after-inscription-start': Field becomes locked once registration starts (only if published)
 * - 'locked-after-competition-start': Field becomes locked once competition starts (only if published)
 *
 * Note: Time-based rules (inscription-start, competition-start) only apply to published competitions.
 * Unpublished competitions can modify all fields except those with 'locked-after-publish' rule.
 *
 * @param fieldName - The name of the field to check
 * @param competition - The competition object with current state
 * @param currentDate - Optional date to check against (defaults to now, useful for testing)
 * @returns FieldEditabilityInfo with isEditable flag, rule, and optional reason
 *
 * @example
 * ```typescript
 * const { isEditable, reason } = getFieldEditability('name', competition);
 * if (!isEditable) {
 *   throw new Error(reason);
 * }
 * ```
 */
export function getFieldEditability(
  fieldName: string,
  competition: Competition | null | undefined,
  currentDate: Date = new Date(),
  options: FieldEditabilityOptions = {},
): FieldEditabilityInfo {
  if (!competition) {
    return { isEditable: false, rule: 'always', reason: 'No competition selected' };
  }

  const rule = FIELD_RULES[fieldName] || 'always';

  // Admin users can bypass all locking rules
  if (options.isAdmin) {
    return { isEditable: true, rule };
  }
  const inscriptionStart = new Date(competition.inscriptionStartDate);
  const competitionStart = new Date(competition.startDate);

  switch (rule) {
    case 'always':
      return { isEditable: true, rule };

    case 'locked-after-publish':
      if (competition.isPublished) {
        return {
          isEditable: false,
          rule,
          reason: 'This field cannot be changed after the competition is published',
        };
      }
      return { isEditable: true, rule };

    case 'locked-after-inscription-start':
      // This rule only applies if the competition is published
      if (!competition.isPublished) {
        return { isEditable: true, rule };
      }
      if (currentDate >= inscriptionStart) {
        return {
          isEditable: false,
          rule,
          reason: 'This field cannot be changed after registration has started',
        };
      }
      return { isEditable: true, rule };

    case 'locked-after-competition-start':
      // This rule only applies if the competition is published
      if (!competition.isPublished) {
        return { isEditable: true, rule };
      }
      if (currentDate >= competitionStart) {
        return {
          isEditable: false,
          rule,
          reason: 'This field cannot be changed after the competition has started',
        };
      }
      return { isEditable: true, rule };

    default:
      return { isEditable: true, rule: 'always' };
  }
}

/**
 * Get the rule for a specific field.
 *
 * @param fieldName - The name of the field
 * @returns The editability rule for the field, or 'always' if not defined
 */
export function getFieldRule(fieldName: string): FieldEditabilityRule {
  return FIELD_RULES[fieldName] || 'always';
}

/**
 * Get all fields with a specific editability rule.
 *
 * @param rule - The editability rule to filter by
 * @returns Array of field names that have the specified rule
 *
 * @example
 * ```typescript
 * const lockedFields = getFieldsByRule('locked-after-publish');
 * // ['isPublished', 'name', 'startDate', 'endDate']
 * ```
 */
export function getFieldsByRule(rule: FieldEditabilityRule): string[] {
  return Object.entries(FIELD_RULES)
    .filter(([, fieldRule]) => fieldRule === rule)
    .map(([fieldName]) => fieldName);
}

/**
 * Validates if multiple fields can be edited based on the competition state.
 * Returns an object mapping field names to their editability info.
 *
 * @param fieldNames - Array of field names to check
 * @param competition - The competition object with current state
 * @param currentDate - Optional date to check against (defaults to now)
 * @returns Object mapping field names to their editability info
 *
 * @example
 * ```typescript
 * const result = validateFieldsEditability(['name', 'location'], competition);
 * if (!result.name.isEditable) {
 *   console.error(`Cannot edit name: ${result.name.reason}`);
 * }
 * ```
 */
export function validateFieldsEditability(
  fieldNames: string[],
  competition: Competition | null | undefined,
  currentDate: Date = new Date(),
  options: FieldEditabilityOptions = {},
): Record<string, FieldEditabilityInfo> {
  return fieldNames.reduce(
    (acc, fieldName) => {
      acc[fieldName] = getFieldEditability(fieldName, competition, currentDate, options);
      return acc;
    },
    {} as Record<string, FieldEditabilityInfo>,
  );
}

/**
 * Checks if any of the provided fields are not editable.
 * Useful for validation before submitting form data.
 *
 * @param fieldNames - Array of field names to check
 * @param competition - The competition object with current state
 * @param currentDate - Optional date to check against (defaults to now)
 * @returns Object with hasErrors flag and array of field names that are not editable
 *
 * @example
 * ```typescript
 * const { hasErrors, lockedFields } = checkLockedFields(['name', 'location'], competition);
 * if (hasErrors) {
 *   throw new Error(`Cannot edit locked fields: ${lockedFields.join(', ')}`);
 * }
 * ```
 */
export function checkLockedFields(
  fieldNames: string[],
  competition: Competition | null | undefined,
  currentDate: Date = new Date(),
  options: FieldEditabilityOptions = {},
): { hasErrors: boolean; lockedFields: string[] } {
  const lockedFields = fieldNames.filter(
    fieldName => !getFieldEditability(fieldName, competition, currentDate, options).isEditable,
  );

  return {
    hasErrors: lockedFields.length > 0,
    lockedFields,
  };
}
