import { Button } from '@/components/ui/button';
import {
  CreateOrganizationDialog,
  OrganizationsTable,
  useOrganizations,
} from '@/features/organization';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AdminOrganizations() {
  const { t } = useTranslation('organization');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { organizations } = useOrganizations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('organizationManagement')}
          </h1>
          <p className="text-muted-foreground">{t('approveRequests')}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus />
          {t('createOrganization')}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t('activeOrganizations')}
          </h2>
          <OrganizationsTable organizations={organizations} />
        </div>
      </div>

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
