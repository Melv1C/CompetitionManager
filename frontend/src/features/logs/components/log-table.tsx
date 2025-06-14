import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Log } from '@competition-manager/core/schemas';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Info,
  User,
} from 'lucide-react';
import { useMemo } from 'react';
import { LogLevelBadge } from './log-level-badge';

interface LogTableProps {
  logs: Log[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalCount: number;
}

function LogDetailsDialog({ log }: { log: Log }) {
  const parsedMeta = useMemo(() => parseLogMeta(log), [log]);

  const formattedMeta = useMemo(() => {
    if (!log.meta) return null;
    try {
      return JSON.stringify(JSON.parse(log.meta), null, 2);
    } catch {
      return log.meta;
    }
  }, [log.meta]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="w-4 h-4" />
          <span className="sr-only">View details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogLevelBadge level={log.level} />
            Log Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Message</h4>
            <p className="text-sm bg-muted p-3 rounded-md break-words">
              {log.message}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Timestamp</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Log ID</h4>
            <p className="text-sm font-mono text-muted-foreground">{log.id}</p>
          </div>

          {/* Enhanced display for HTTP logs */}
          {parsedMeta.httpData && (
            <div>
              <h4 className="text-sm font-medium mb-2">HTTP Request Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${getMethodColor(
                      parsedMeta.httpData.method
                    )}`}
                  >
                    {parsedMeta.httpData.method}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="outline"
                    className={`ml-2 ${getStatusColor(
                      parsedMeta.httpData.status
                    )}`}
                  >
                    {parsedMeta.httpData.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Path:</span>
                  <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                    {parsedMeta.httpData.path}
                  </code>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {parsedMeta.httpData.duration}ms
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User ID if available */}
          {parsedMeta.userId && (
            <div>
              <h4 className="text-sm font-medium mb-2">User</h4>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono">{parsedMeta.userId}</span>
              </div>
            </div>
          )}

          {formattedMeta && (
            <div>
              <h4 className="text-sm font-medium mb-2">Raw Metadata</h4>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                {formattedMeta}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalCount,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalCount: number;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalCount} logs
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="flex items-center space-x-1">
          {/* Show first page */}
          <Button
            variant={1 === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(1)}
            className="w-8 h-8 p-0"
          >
            1
          </Button>

          {/* Show ellipsis if current page is far from beginning */}
          {currentPage > 4 && totalPages > 7 && (
            <span className="text-muted-foreground px-1">...</span>
          )}

          {/* Show pages around current page */}
          {Array.from({ length: Math.min(5, totalPages - 2) }, (_, i) => {
            const pageNum = Math.max(2, currentPage - 2) + i;
            if (pageNum >= totalPages || pageNum <= 1) return null;

            const isCurrentPage = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}

          {/* Show ellipsis if current page is far from end */}
          {currentPage < totalPages - 3 && totalPages > 7 && (
            <span className="text-muted-foreground px-1">...</span>
          )}

          {/* Show last page if not already shown */}
          {totalPages > 1 && (
            <Button
              variant={currentPage === totalPages ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 p-0"
            >
              {totalPages}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Utility functions for parsing log meta
interface ParsedLogMeta {
  userId?: string;
  httpData?: {
    method: string;
    path: string;
    status: number;
    duration: number;
  };
  rawMeta?: Record<string, unknown>;
}

function parseLogMeta(log: Log): ParsedLogMeta {
  if (!log.meta) return {};

  try {
    const meta = JSON.parse(log.meta) as Record<string, unknown>;

    const result: ParsedLogMeta = {
      userId: meta.userId as string | undefined,
      rawMeta: meta,
    };

    // For HTTP logs, extract HTTP-specific data
    if (
      log.level === 'http' &&
      meta.method &&
      meta.path &&
      meta.status &&
      meta.duration !== undefined
    ) {
      result.httpData = {
        method: meta.method as string,
        path: meta.path as string,
        status: meta.status as number,
        duration: meta.duration as number,
      };
    }

    return result;
  } catch {
    return {};
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
  if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800';
  if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
  if (status >= 500) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-green-100 text-green-800';
    case 'POST':
      return 'bg-blue-100 text-blue-800';
    case 'PUT':
      return 'bg-orange-100 text-orange-800';
    case 'PATCH':
      return 'bg-purple-100 text-purple-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function LogTable({
  logs,
  isLoading,
  error,
  onRefresh,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalCount,
}: LogTableProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h3 className="text-lg font-semibold">Failed to load logs</h3>
              <p className="text-muted-foreground">
                {error.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={onRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <Info className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No logs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Logs</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalCount} total logs
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[200px]">Details</TableHead>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const parsedMeta = parseLogMeta(log);
              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <LogLevelBadge level={log.level} />
                  </TableCell>
                  <TableCell className="max-w-0">
                    <div className="truncate pr-2" title={log.message}>
                      {log.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* HTTP-specific details */}
                      {parsedMeta.httpData && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge
                            variant="outline"
                            className={`${getMethodColor(
                              parsedMeta.httpData.method
                            )} text-xs`}
                          >
                            {parsedMeta.httpData.method}
                          </Badge>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded max-w-[150px] truncate">
                            {parsedMeta.httpData.path}
                          </code>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              parsedMeta.httpData.status
                            )} text-xs`}
                          >
                            {parsedMeta.httpData.status}
                          </Badge>
                          <span className="text-muted-foreground text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {parsedMeta.httpData.duration}ms
                          </span>
                        </div>
                      )}

                      {/* User ID for all logs if available */}
                      {parsedMeta.userId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span
                            className="font-mono truncate max-w-[100px]"
                            title={parsedMeta.userId}
                          >
                            {parsedMeta.userId}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <LogDetailsDialog log={log} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        )}
      </CardContent>
    </Card>
  );
}
