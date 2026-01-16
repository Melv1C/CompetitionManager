import { cn } from '@repo/ui';
import { Flag, Globe, Info, UserCheck } from 'lucide-react';
import { getFieldRuleStyle, type FieldEditabilityRule } from '../../utils/field-editability';

export function FieldRulesLegend() {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border bg-card">
      <div className="border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Info className="h-4 w-4 text-muted-foreground" />
          Field Locking Rules
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Fields with badges become locked at different stages. Fields without badges can always be
          edited.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            'locked-after-publish',
            'locked-after-inscription-start',
            'locked-after-competition-start',
          ] as FieldEditabilityRule[]
        ).map(rule => {
          const style = getFieldRuleStyle(rule);
          const IconComponent =
            rule === 'locked-after-publish'
              ? Globe
              : rule === 'locked-after-inscription-start'
                ? UserCheck
                : Flag;

          return (
            <div
              key={rule}
              className={cn(
                'flex items-start gap-3 rounded-md border p-3 transition-colors',
                style.bgClassName,
                style.borderClassName,
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/50',
                )}
              >
                <IconComponent className={cn('h-4 w-4', style.textClassName)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-medium', style.textClassName)}>{style.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{style.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
