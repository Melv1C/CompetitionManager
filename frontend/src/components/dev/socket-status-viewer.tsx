import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSocket, useSocketEvents } from '@/store/socket';
import {
  Activity,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SocketStatusViewerProps {
  className?: string;
}

export function SocketStatusViewer({ className }: SocketStatusViewerProps) {
  const {
    status,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    socket,
  } = useSocket();
  const { onError, onNotification } = useSocketEvents();
  const [logs, setLogs] = useState<
    Array<{
      timestamp: Date;
      message: string;
      type: 'info' | 'error' | 'success';
    }>
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Listen to socket events for logging
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeError = onError((data) => {
      setLogs((prev) => [
        ...prev.slice(-9), // Keep only last 10 logs
        {
          timestamp: new Date(),
          message: `Error: ${data.message}`,
          type: 'error',
        },
      ]);
    });

    const unsubscribeNotification = onNotification((data) => {
      setLogs((prev) => [
        ...prev.slice(-9), // Keep only last 10 logs
        {
          timestamp: new Date(),
          message: `${data.type}: ${data.message}`,
          type: 'info',
        },
      ]);
    });

    return () => {
      unsubscribeError();
      unsubscribeNotification();
    };
  }, [onError, onNotification, isConnected]);

  // Add connection status changes to logs
  useEffect(() => {
    setLogs((prev) => [
      ...prev.slice(-9),
      {
        timestamp: new Date(),
        message: `Connection status: ${status}`,
        type: isConnected ? 'success' : 'info',
      },
    ]);
  }, [status, isConnected]);

  if (import.meta.env.VITE_APP_ENV === 'development') {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const testConnection = () => {
    if (socket?.connected) {
      socket.emit('ping');
      setLogs((prev) => [
        ...prev.slice(-9),
        { timestamp: new Date(), message: 'Ping sent', type: 'info' },
      ]);
    }
  };
  return (
    <div className={`fixed bottom-2 right-2 z-50 ${className}`}>
      <Card
        className={`w-80 ${
          isExpanded ? 'max-h-96' : 'h-auto'
        } overflow-hidden bg-background/95 backdrop-blur border-2 transition-all duration-200`}
      >
        <CardHeader
          className="block cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Socket Status (Dev Mode)
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <div className="flex-1" />
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3">
            {/* Status Overview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant={isConnected ? 'default' : 'secondary'}>
                  {status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Attempts: {reconnectAttempts}
              </div>
            </div>

            {/* Connection Info */}
            {socket && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Socket ID:</span>
                  <span className="font-mono">{socket.id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected:</span>
                  <span>{socket.connected ? 'Yes' : 'No'}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => (isConnected ? disconnect() : connect())}
                className="flex-1"
              >
                {isConnected ? (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connect
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={testConnection}
                disabled={!isConnected}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Ping
              </Button>
            </div>

            <Separator />

            {/* Event Logs */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-medium">
                <Clock className="h-3 w-3" />
                Recent Events
              </div>

              <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground italic">
                    No events yet...
                  </div>
                ) : (
                  logs
                    .slice(-5)
                    .reverse()
                    .map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="text-muted-foreground min-w-[45px]">
                          {log.timestamp.toLocaleTimeString().slice(0, 5)}
                        </div>
                        <div
                          className={`flex-1 ${
                            log.type === 'error'
                              ? 'text-red-500'
                              : log.type === 'success'
                              ? 'text-green-500'
                              : 'text-foreground'
                          }`}
                        >
                          {log.message}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
