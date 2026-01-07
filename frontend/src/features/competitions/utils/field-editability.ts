import type { FieldEditabilityRule } from '@repo/core/utils';

// Re-export core utilities
export {
  checkLockedFields,
  getFieldEditability,
  getFieldRule,
  getFieldsByRule,
  validateFieldsEditability,
  type FieldEditabilityInfo,
  type FieldEditabilityOptions,
  type FieldEditabilityRule,
} from '@repo/core/utils';

/**
 * React-specific styling information for field editability rules.
 * Get the icon and color for a field based on its editability rule.
 */
export function getFieldRuleStyle(rule: FieldEditabilityRule): {
  icon: React.ComponentType<{ className?: string }>;
  iconName: string;
  bgClassName: string;
  textClassName: string;
  borderClassName: string;
  label: string;
  description: string;
} {
  switch (rule) {
    case 'always':
      return {
        icon: () => null, // Will use Check icon
        iconName: 'Check',
        bgClassName: 'bg-green-50 dark:bg-green-950',
        textClassName: 'text-green-700 dark:text-green-300',
        borderClassName: 'border-green-200 dark:border-green-800',
        label: 'Editable anytime',
        description: 'Can be changed at any point',
      };
    case 'locked-after-publish':
      return {
        icon: () => null, // Will use Globe icon
        iconName: 'Globe',
        bgClassName: 'bg-blue-50 dark:bg-blue-950',
        textClassName: 'text-blue-700 dark:text-blue-300',
        borderClassName: 'border-blue-200 dark:border-blue-800',
        label: 'Locked when published',
        description: 'Cannot change once competition is public',
      };
    case 'locked-after-inscription-start':
      return {
        icon: () => null, // Will use UserCheck icon
        iconName: 'UserCheck',
        bgClassName: 'bg-amber-50 dark:bg-amber-950',
        textClassName: 'text-amber-700 dark:text-amber-300',
        borderClassName: 'border-amber-200 dark:border-amber-800',
        label: 'Locked after registration opens',
        description: 'Cannot change once athletes start registering',
      };
    case 'locked-after-competition-start':
      return {
        icon: () => null, // Will use Flag icon
        iconName: 'Flag',
        bgClassName: 'bg-red-50 dark:bg-red-950',
        textClassName: 'text-red-700 dark:text-red-300',
        borderClassName: 'border-red-200 dark:border-red-800',
        label: 'Locked when competition starts',
        description: 'Cannot change once competition begins',
      };
  }
}
