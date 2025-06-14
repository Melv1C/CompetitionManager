import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface LoginButtonProps {
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export function LoginButton({
  isMobile = false,
  onMobileMenuClose,
}: LoginButtonProps) {
  const { t } = useTranslation('common');

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Button className="w-full" asChild>
          <Link to="/login" onClick={onMobileMenuClose}>
            {t('login')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link to="/login">{t('login')}</Link>
    </Button>
  );
}
