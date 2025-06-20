import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganizations } from '@/features/organization/hooks/use-organizations';
import { authClient } from '@/lib/auth-client';
import type { User as UserType } from '@repo/core/schemas';
import { Building2, LogOut, Settings, Shield, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UserButtonProps {
  user: UserType;
  onMobileMenuClose?: () => void;
}

export function UserButton({ user, onMobileMenuClose }: UserButtonProps) {
  const { organizations } = useOrganizations();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Successfully signed out!');
            navigate('/');
          },
        },
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{t('profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('settings')}</span>
        </DropdownMenuItem>
        {organizations.length > 0 && (
          <DropdownMenuItem asChild>
            <Link to="/organization" onClick={onMobileMenuClose}>
              <Building2 className="mr-2 h-4 w-4" />
              <span>{t('organizationDashboard')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin" onClick={onMobileMenuClose}>
              <Shield className="mr-2 h-4 w-4" />
              <span>{t('adminDashboard')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
