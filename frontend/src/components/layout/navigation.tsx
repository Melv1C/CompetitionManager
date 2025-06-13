import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  navItems: NavItem[];
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export function Navigation({
  navItems,
  isMobile = false,
  onMobileMenuClose,
}: NavigationProps) {
  const location = useLocation();

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (isMobile) {
    return (
      <>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              isActivePath(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={onMobileMenuClose}
          >
            {item.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            isActivePath(item.href)
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
