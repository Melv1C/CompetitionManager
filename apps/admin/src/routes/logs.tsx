import { LogDetailSheet } from '@/features/logs';
import { LogsFilter } from '@/features/logs/components/logs-filter';
import { LogsTable } from '@/features/logs/components/logs-table';
import { createFileRoute } from '@tanstack/react-router';

function LogsPage() {
  return (
    <>
      <LogsFilter />
      <LogsTable />
      <LogDetailSheet />
    </>
  );
}

export const Route = createFileRoute('/logs')({
  component: LogsPage,
});
