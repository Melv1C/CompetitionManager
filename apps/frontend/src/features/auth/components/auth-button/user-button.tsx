import { authClient } from '@/libs/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@melv1c/ui-kit';
import { User as UserType } from '@repo/utils';
import { useNavigate } from '@tanstack/react-router';
import { Link, LogOut, Settings, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface UserButtonProps {
  user: UserType;
  onMobileMenuClose?: () => void;
}

export function UserButton({ user, onMobileMenuClose }: UserButtonProps) {
  // const { organizations } = useOrganizations();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success(t('messages:signOutSuccess'));
            navigate({ to: '/' });
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(t('messages:signOutError'));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-avatar">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" onClick={onMobileMenuClose}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('navigation:profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('navigation:settings')}</span>
        </DropdownMenuItem>
        {/* {organizations.length > 0 && (
          <DropdownMenuItem asChild>
            <Link to="/organization" onClick={onMobileMenuClose}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>{t('navigation:organizationDashboard')}</span>
            </Link>
          </DropdownMenuItem>
        )} */}
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin" onClick={onMobileMenuClose}>
              <Shield className="mr-2 h-4 w-4" />
              <span>{t('navigation:adminDashboard')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth:signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
