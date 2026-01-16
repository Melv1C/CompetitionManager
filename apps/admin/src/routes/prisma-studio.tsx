import { env } from '@/lib/env';
import { createStudioBFFClient } from '@prisma/studio-core/data/bff';
import { createPostgresAdapter } from '@prisma/studio-core/data/postgres-core';
import { Studio } from '@prisma/studio-core/ui';
import '@prisma/studio-core/ui/index.css';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/prisma-studio')({
  component: PrismaStudioPage,
});

function PrismaStudioPage() {
  const adapter = useMemo(() => {
    const executor = createStudioBFFClient({
      url: `${env.VITE_API_URL}/api/studio`,
      // fetch: (input, init) => {
      //   return fetch(input, { ...init, credentials: 'include' });
      // },
    });

    return createPostgresAdapter({ executor });
  }, []);

  return (
    <div className="flex-1">
      <Studio adapter={adapter} />
    </div>
  );
}
