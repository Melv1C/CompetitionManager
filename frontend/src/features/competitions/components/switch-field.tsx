import { FormControl, FormItem, FormLabel, Switch } from '@repo/ui';

interface SwitchFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: SwitchFieldProps) {
  return (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">{label}</FormLabel>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <FormControl>
        <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </FormControl>
    </FormItem>
  );
}
