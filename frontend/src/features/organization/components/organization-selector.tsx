import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Building2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganizations } from '../hooks/use-organizations';

interface OrganizationSelectorProps {
  className?: string;
}

export function OrganizationSelector({ className }: OrganizationSelectorProps) {
  const { t } = useTranslation('organization');
  const { organizations, activeOrganization, setActiveOrganization } =
    useOrganizations();

  const handleOrganizationSelect = (organizationId: string) => {
    setActiveOrganization(organizationId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${className}`}
        >
          {activeOrganization?.logo ? (
            <Avatar className="size-8 rounded-lg">
              <AvatarImage
                src={activeOrganization.logo}
                alt={activeOrganization.name}
              />
              <AvatarFallback className="size-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" />
            </div>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {activeOrganization?.name || t('noOrganization')}
            </span>
            <span className="truncate text-xs">{t('currentOrganization')}</span>
          </div>
          <ChevronDown className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {t('organizations')}
        </DropdownMenuLabel>
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            className="gap-2 p-2"
            onClick={() => handleOrganizationSelect(org.id)}
          >
            {org.logo ? (
              <Avatar className="size-6">
                <AvatarImage src={org.logo} alt={org.name} />
                <AvatarFallback className="size-6 rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <Building2 className="size-4 shrink-0" />
              </div>
            )}
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
