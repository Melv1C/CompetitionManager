import { useAuth } from '@/features/auth';
import { OrganizationSelector, useOrganizations } from '@/features/organization';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { authClient } from '@/lib/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@repo/ui';
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  Trophy,
  UserCheck2,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function OrganizationLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { activeOrganization } = useOrganizations();
  const { currentCompetition } = useOrganizationCompetitionStore();
  const navItems = [
    {
      title: t('navigation:overview'),
      url: '/organization',
      icon: Home,
    },
    {
      title: t('competitions.title'),
      url: '/organization/competitions',
      icon: CalendarDays,
    },
    {
      title: t('navigation:members'),
      url: '/organization/members',
      icon: Users,
    },
    {
      title: t('navigation:analytics'),
      url: '/organization/analytics',
      icon: TrendingUp,
    },
    {
      title: t('navigation:settings'),
      url: '/organization/settings',
      icon: Settings,
    },
  ];

  const competitionNavItems = useMemo(() => {
    return currentCompetition
      ? [
          {
            title: t('navigation:overview'),
            url: `/organization/competitions/${currentCompetition.eid}`,
            icon: Home,
          },
          {
            title: t('inscriptions.title'),
            url: `/organization/competitions/${currentCompetition.eid}/inscriptions`,
            icon: Users,
          },
          {
            title: t('confirmations.title'),
            url: `/organization/competitions/${currentCompetition.eid}/confirmations`,
            icon: UserCheck2,
          },
          {
            title: t('events.title'),
            url: `/organization/competitions/${currentCompetition.eid}/events`,
            icon: CalendarClock,
          },
          {
            title: t('results.title'),
            url: `/organization/competitions/${currentCompetition.eid}/results`,
            icon: Trophy,
          },
          {
            title: t('navigation:settings'),
            url: `/organization/competitions/${currentCompetition.eid}/settings`,
            icon: Settings,
          },
        ]
      : [];
  }, [currentCompetition]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Sign out successful');
            navigate('/');
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed');
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <OrganizationSelector />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <ScrollArea className="flex-1 overflow-hidden">
          {activeOrganization && (
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>{t('organizationPanel')}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {currentCompetition && (
                <SidebarGroup className="mt-4">
                  <SidebarGroupLabel>{currentCompetition.name}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {competitionNavItems.map(item => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                            <Link to={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/" className="flex items-center gap-2">
                          <ArrowLeft className="size-4" />
                          <span>{t('navigation:backToSite')}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          )}
        </ScrollArea>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                      <AvatarFallback className="rounded-lg">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || 'User'}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                        <AvatarFallback className="rounded-lg">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name || 'User'}</span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    {t('auth:signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">
            {location.pathname.includes('/competitions/') && currentCompetition
              ? currentCompetition.name
              : 'Organization'}
          </h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
