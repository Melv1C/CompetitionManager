import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@melv1c/ui-kit';
import { APP_NAME } from '@repo/utils';
import { Link, useRouterState } from '@tanstack/react-router';
import { NavItem } from '../type';
import { NavUser } from './nav-user';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems: NavItem[];
};

export function AppSidebar({ navItems, ...props }: AppSidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
