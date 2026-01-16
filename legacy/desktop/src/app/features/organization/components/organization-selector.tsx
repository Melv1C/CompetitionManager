import { ORGANIZATION_COMPETITIONS_QUERY_KEY } from '@/features/competitions';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@repo/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganizations } from '../hooks/use-organizations';

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const { t } = useTranslation('organization');
  const { organizations, activeOrganization, setActiveOrganization } = useOrganizations();
  const queryClient = useQueryClient();

  const handleOrganizationSelect = (organizationId: string) => {
    setActiveOrganization(organizationId);
    queryClient.invalidateQueries({ queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            flex w-full items-center gap-3 rounded-lg border border-border 
            bg-background px-3 py-2 text-left transition-colors
            hover:bg-accent hover:text-accent-foreground
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            data-[state=open]:bg-accent data-[state=open]:text-accent-foreground
            ${className}
          `}
        >
          {activeOrganization?.logo ? (
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={activeOrganization.logo} alt={activeOrganization.name} />
              <AvatarFallback className="size-8 rounded-lg bg-muted">
                <Building2 className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Building2 className="size-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {activeOrganization?.name || t('noOrganization')}
            </div>
            <div className="text-xs text-muted-foreground truncate">{t('currentOrganization')}</div>
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
          {t('organizations')}
        </DropdownMenuLabel>
        {organizations.map(org => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center gap-3 px-2 py-2.5 cursor-pointer"
            onClick={() => handleOrganizationSelect(org.id)}
          >
            {org.logo ? (
              <Avatar className="size-6">
                <AvatarImage src={org.logo} alt={org.name} />
                <AvatarFallback className="size-6 rounded-sm bg-muted">
                  <Building2 className="size-3" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex size-6 items-center justify-center rounded-sm bg-muted">
                <Building2 className="size-3" />
              </div>
            )}
            <span className="font-medium truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
