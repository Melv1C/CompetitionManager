import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@melv1c/ui-kit';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { Database, FileText, LayoutDashboard } from 'lucide-react';
import { NavItem } from '../type';
import { AppSidebar } from './app-sidebar';

const navItems: NavItem[] = [
  {
    url: '/',
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of the admin panel',
  },
  {
    url: '/logs',
    title: 'Logs',
    icon: FileText,
    description: 'View application logs',
  },
  {
    url: '/prisma-studio',
    title: 'Prisma Studio',
    icon: Database,
    description: 'Database management interface',
  },
];

export function AdminLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentPage = navItems.find(item => item.url === currentPath);

  if (!currentPage) {
    throw new Error(`No nav item found for path: ${currentPath}`);
  }

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage?.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6 flex flex-col h-full">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{currentPage?.title}</h2>
              {currentPage?.description && (
                <p className="text-muted-foreground">{currentPage?.description}</p>
              )}
            </div>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
