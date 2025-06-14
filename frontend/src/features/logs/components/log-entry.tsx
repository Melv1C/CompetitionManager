import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type Log } from '@competition-manager/core/schemas';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Clock, Code, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { LogLevelBadge } from './log-level-badge';

interface LogEntryProps {
  log: Log;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function LogEntry({
  log,
  isExpanded = false,
  onToggleExpand,
}: LogEntryProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  const expanded = onToggleExpand ? isExpanded : localExpanded;
  const handleToggle =
    onToggleExpand || (() => setLocalExpanded(!localExpanded));

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(log.message);
      toast.success('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy message');
    }
  };

  const handleCopyMeta = async () => {
    if (!log.meta) return;
    try {
      await navigator.clipboard.writeText(log.meta);
      toast.success('Metadata copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy metadata');
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss.SSS');
  };

  const formatMeta = (meta: string | null) => {
    if (!meta) return null;
    try {
      return JSON.stringify(JSON.parse(meta), null, 2);
    } catch {
      return meta;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="p-1 h-6 w-6 shrink-0 mt-1"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <LogLevelBadge level={log.level} />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatTimestamp(log.timestamp)}
              </div>
              <Badge variant="outline" className="text-xs">
                {log.id}
              </Badge>
            </div>

            {/* Message Preview */}
            <div className="flex items-start gap-2">
              <p className={`text-sm ${expanded ? '' : 'line-clamp-2'} flex-1`}>
                {log.message}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMessage}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 shrink-0"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <>
            <Separator className="my-3" />
            <div className="space-y-3">
              {/* Full Message */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">Message</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyMessage}
                    className="p-1 h-5 w-5"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {log.message}
                  </pre>
                </div>
              </div>

              {/* Metadata */}
              {log.meta && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      Metadata
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyMeta}
                      className="p-1 h-5 w-5"
                      title="Copy metadata"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-muted rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs font-mono">
                      {formatMeta(log.meta)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>ID: {log.id}</span>
                <span>Level: {log.level}</span>
                <span>Timestamp: {formatTimestamp(log.timestamp)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
