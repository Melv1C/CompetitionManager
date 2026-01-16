import { Button } from '@melv1c/ui-kit';
import { Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginButtonProps {
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export function LoginButton({ isMobile = false, onMobileMenuClose }: LoginButtonProps) {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Button className="w-full" asChild>
          <Link to="/auth/sign-in" onClick={onMobileMenuClose}>
            {t('auth:signIn')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link to="/auth/sign-in">{t('auth:signIn')}</Link>
    </Button>
  );
}
