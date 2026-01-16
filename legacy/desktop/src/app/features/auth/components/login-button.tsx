import { Button } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface LoginButtonProps {
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export function LoginButton({ isMobile = false, onMobileMenuClose }: LoginButtonProps) {
  const { t } = useTranslation('auth');

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Button className="w-full" asChild>
          <Link to="/auth/sign-in" onClick={onMobileMenuClose}>
            {t('signIn')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link to="/auth/sign-in">{t('signIn')}</Link>
    </Button>
  );
}
