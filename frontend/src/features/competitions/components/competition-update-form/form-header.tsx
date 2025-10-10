import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Competition } from '@repo/core/schemas';
import { AlertCircle, Save } from 'lucide-react';
import { getFieldEditability } from '../../utils/field-editability';

interface FormHeaderProps {
  competition: Competition;
  isDirty: boolean;
  canEdit: boolean;
  disabled: boolean;
  isPending: boolean;
  onPublishToggle: (checked: boolean) => void;
  onSave: () => void;
}

export function FormHeader({
  competition,
  isDirty,
  canEdit,
  disabled,
  isPending,
  onPublishToggle,
  onSave,
}: FormHeaderProps) {
  return (
    <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{competition.name}</h1>
        {isDirty && canEdit && (
          <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            Unsaved changes
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Publish Toggle */}
        <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
          <span className="text-sm font-medium">Published</span>
          <Switch
            checked={competition.isPublished}
            onCheckedChange={onPublishToggle}
            disabled={
              !canEdit || !getFieldEditability('isPublished', competition).isEditable || isPending
            }
          />
          {competition.isPublished && (
            <span className="text-xs text-green-600 dark:text-green-400">●</span>
          )}
        </div>

        {/* Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit" disabled={disabled} onClick={onSave}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save changes (Ctrl+S)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
