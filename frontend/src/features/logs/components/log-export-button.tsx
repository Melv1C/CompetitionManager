import { Button } from '@/components/ui/button';
import type { Log } from '@competition-manager/core/schemas';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface LogExportButtonProps {
  logs: Log[];
  isLoading?: boolean;
  disabled?: boolean;
}

export function LogExportButton({
  logs,
  isLoading = false,
  disabled = false,
}: LogExportButtonProps) {
  const handleExport = () => {
    try {
      const exportData = logs.map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        meta: log.meta,
        id: log.id,
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export logs');
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || isLoading || logs.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Export
    </Button>
  );
}
