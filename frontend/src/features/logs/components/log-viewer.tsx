import { Button } from '@/components/ui/button';
import {
  LogLevel$,
  LogQuery$,
  type LogQuery,
} from '@competition-manager/core/schemas';
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
      levels: [LogLevel$.Values.error, LogLevel$.Values.warn], // Default to error and warn levels
      limit: 20, // Smaller page size for better UX
      offset: 0,
    })
  );

  const { data, isLoading, error, refetch } = useLogs(filters);
  const cleanupMutation = useLogCleanup();

  // Extract data from the paginated response
  const logs = data?.logs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;
  const pageSize = data?.pageSize || 20;

  const handleRefresh = () => {
    refetch();
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
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <LogExportButton
            logs={logs}
            isLoading={isLoading}
            disabled={isLoading || logs.length === 0}
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
        isLoading={isLoading}
      />

      {/* Logs Table */}
      <LogTable
        logs={logs}
        isLoading={isLoading}
        error={error}
        onRefresh={handleRefresh}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        totalCount={totalCount}
      />
    </div>
  );
}
