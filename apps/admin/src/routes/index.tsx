import { useAPIHealth } from '@/hooks/use-api-health';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@melv1c/ui-kit';
import { APP_VERSION } from '@repo/utils';
import { createFileRoute } from '@tanstack/react-router';
import { Activity, CheckCircle, Database, RefreshCw, Server, XCircle } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { data, isPending, isError, refetch, isFetching } = useAPIHealth();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backend Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(isPending || isFetching) && (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  </>
                )}
                {!isFetching && isError && (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">Offline</span>
                  </>
                )}
                {!isFetching && data && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Online</span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Retry connection"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">App Version</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{APP_VERSION}</div>
            <p className="text-xs text-muted-foreground">Current version</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/logs"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">View Logs</h3>
                <p className="text-sm text-muted-foreground">Monitor application logs and errors</p>
              </div>
            </a>
            <a
              href="/prisma-studio"
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Prisma Studio</h3>
                <p className="text-sm text-muted-foreground">Browse and edit database records</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
