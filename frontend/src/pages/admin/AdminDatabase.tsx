import { apiClient } from '@/lib/api-client';
import { env } from '@/lib/env';
import '@/studio.css';
import { createStudioBFFClient } from '@prisma/studio-core/data/bff';
import { createPostgresAdapter } from '@prisma/studio-core/data/postgres-core';
import { Studio } from '@prisma/studio-core/ui';
import { useMemo } from 'react';

export function AdminDatabase() {
  const adapter = useMemo(() => {
    // 1. Create a client that points to your backend endpoint
    const executor = createStudioBFFClient({
      url: `${env.VITE_API_URL}/api/studio`,
      customHeaders: {},
      customPayload: {},
      fetch: async (input, init = {}) => {
        const response = await apiClient.request({
          url: input.toString(),
          method: init.method,
          data: init.body,
        });
        // Mimic fetch Response object minimally
        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          json: async () => response.data,
          text: async () => JSON.stringify(response.data),
        } as Response;
      },
    });

    // 2. Create a Postgres adapter with the executor
    const adapter = createPostgresAdapter({ executor });
    return adapter;
  }, []);
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
        <p className="text-muted-foreground">Manage your database with Prisma Studio.</p>
      </div>
      <div className="w-full h-full flex-1 border rounded-lg overflow-hidden">
        <Studio adapter={adapter} />
      </div>
    </div>
  );
}
