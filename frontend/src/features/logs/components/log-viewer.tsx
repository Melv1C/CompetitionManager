import { Button } from '@/components/ui/button';
import { LogLevel$, LogQuery$, type LogQuery } from '@repo/core/schemas';
import { FileText, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLogCleanup, useLogs } from '../hooks/use-logs';
import { LogExportButton } from './log-export-button';
import { LogFilters } from './log-filters';
import { LogTable } from './log-table';

export function LogViewer() {
  const [filters, setFilters] = useState<LogQuery>(
    LogQuery$.parse({
      levels: [LogLevel$.enum.error, LogLevel$.enum.warn], // Default to error and warn levels
      limit: 20, // Smaller page size for better UX
      offset: 0,
    })
  );

  const logs = useLogs(filters);
  const cleanupMutation = useLogCleanup();

  const handleRefresh = () => {
    logs.refetch();
    toast.success('Logs refreshed');
  };

  const handleCleanup = () => {
    cleanupMutation.mutate();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 20),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8" />
            System Logs
          </h1>
          <p className="text-muted-foreground">
            Monitor and analyze application logs and system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={logs.isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${logs.isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <LogExportButton
            logs={logs.data?.logs || []}
            isLoading={logs.isLoading}
            disabled={logs.isLoading || logs.data?.logs.length === 0}
          />
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={cleanupMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {cleanupMutation.isPending ? 'Cleaning...' : 'Cleanup Old'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LogFilters
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={logs.isLoading}
      />

      {/* Logs Table */}
      <LogTable
        logs={logs.data?.logs || []}
        isLoading={logs.isLoading}
        error={logs.error}
        onRefresh={handleRefresh}
        currentPage={logs.data?.page || 1}
        totalPages={logs.data?.totalPages || 1}
        onPageChange={handlePageChange}
        pageSize={logs.data?.pageSize || 20}
        totalCount={logs.data?.totalCount || 0}
      />
    </div>
  );
}
