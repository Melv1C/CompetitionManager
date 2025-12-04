import type { Competition } from '@repo/core/schemas';
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui';
import { Flag, Globe, UserCheck } from 'lucide-react';
import { getFieldEditability, getFieldRuleStyle } from '../../utils/field-editability';

interface FieldWrapperProps {
  fieldName: string;
  children: React.ReactNode;
  competition: Competition;
  className?: string;
}

export function FieldWrapper({ fieldName, children, competition, className }: FieldWrapperProps) {
  const editability = getFieldEditability(fieldName, competition);
  const style = getFieldRuleStyle(editability.rule);

  // Get the appropriate icon based on rule (not editability)
  const IconComponent =
    editability.rule === 'locked-after-publish'
      ? Globe
      : editability.rule === 'locked-after-inscription-start'
        ? UserCheck
        : editability.rule === 'locked-after-competition-start'
          ? Flag
          : null;

  // Show badge only if field has a locking rule (not "always")
  const showBadge = editability.rule !== 'always' && IconComponent;

  return (
    <div className={cn('relative', className)}>
      {children}
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm',
                  style.bgClassName,
                  style.borderClassName,
                  // Make editable fields more subtle
                  editability.isEditable && 'opacity-50 hover:opacity-100 transition-opacity',
                )}
              >
                <IconComponent className={cn('h-4 w-4', style.textClassName)} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold">{style.label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {editability.isEditable ? style.description : editability.reason}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
