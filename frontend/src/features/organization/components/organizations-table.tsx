import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { authClient } from '@/lib/auth-client';
import { Building2, ExternalLink, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  slug: string;
  metadata?: Record<string, unknown>;
  logo?: string | null | undefined;
}

interface OrganizationsTableProps {
  organizations: Organization[];
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const { t } = useTranslation('organization');
  const navigate = useNavigate();
  const handleOpenOrganization = async (organizationId: string) => {
    try {
      await authClient.organization.setActive({
        organizationId,
      });
      navigate('/organization');
      toast.success('Organization activated');
    } catch (error) {
      console.error('Failed to set active organization:', error);
      toast.error('Failed to activate organization');
    }
  };

  const handleDeleteOrganization = async (
    organizationId: string,
    organizationName: string
  ) => {
    try {
      await authClient.organization.delete({
        organizationId,
      });
      toast.success(`Organization "${organizationName}" deleted successfully`);
      // Note: The organizations list should automatically update via the hook
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {t('noOrganizations')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        {' '}
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t('organizationName')}</TableHead>
            <TableHead>{t('organizationSlug')}</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={org.logo || ''} alt={org.name} />
                  <AvatarFallback>
                    <Building2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{org.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">
                {org.slug}
              </TableCell>{' '}
              <TableCell className="text-muted-foreground">
                {formatDate(org.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenOrganization(org.id)}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open organization</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete organization</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{org.name}"? This
                          action cannot be undone and will permanently delete
                          the organization and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteOrganization(org.id, org.name)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
