import {
  CreateOrganizationDialog,
  OrganizationsTable,
  useOrganizations,
} from '@/features/organization';
import { Button } from '@repo/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';

export function AdminOrganizations() {
  const { t } = useTranslation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { organizations } = useOrganizations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('organization:management')}</h1>
          <p className="text-muted-foreground">{t('organization:approveRequests')}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus />
          {t('buttons:create')}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('organization:activeOrganizations')}</h2>
          <OrganizationsTable organizations={organizations} />
        </div>
      </div>

      <CreateOrganizationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
