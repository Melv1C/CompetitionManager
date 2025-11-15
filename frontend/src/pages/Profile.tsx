import { useAuth } from '@/features/auth';
import { authClient } from '@/lib/auth-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Separator,
} from '@repo/ui';
import { CheckCircle2, Mail, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPending, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('profile:passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('profile:passwordTooShort'));
      return;
    }

    setIsChangingPassword(true);
    try {
      await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: false,
      });

      toast.success(t('profile:passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordDialogOpen(false);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(t('profile:passwordChangeError'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user) return;
    setIsSendingVerification(true);
    try {
      await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: window.location.origin,
      });

      toast.success(t('profile:verificationEmailSent'));
    } catch (error) {
      console.error('Send verification error:', error);
      toast.error(t('profile:verificationEmailError'));
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md mx-auto space-y-4 p-6">
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
          <div className="space-y-3 mt-6">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/'); // Redirect to home if no user (shouldn't happen due to RequireAuth)
    return null;
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('profile:title')}</h1>
        <p className="text-muted-foreground mt-2">{t('profile:description')}</p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>{t('profile:accountInformation')}</CardTitle>
          </div>
          <CardDescription>{t('profile:accountInformationDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('auth:name')}</Label>
            <Input value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>{t('auth:email')}</Label>
            <div className="flex items-center gap-2">
              <Input value={user.email} disabled className="flex-1" />
              {user.emailVerified ? (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="whitespace-nowrap">{t('profile:verified')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500">
                  <Mail className="h-4 w-4" />
                  <span className="whitespace-nowrap">{t('profile:notVerified')}</span>
                </div>
              )}
            </div>
          </div>
          {user.image && (
            <div className="space-y-2">
              <Label>{t('profile:profilePicture')}</Label>
              <div className="flex items-center gap-4">
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Verification */}
      {!user.emailVerified && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              <CardTitle>{t('profile:emailVerification')}</CardTitle>
            </div>
            <CardDescription>{t('profile:emailVerificationDescription')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={handleSendVerificationEmail}
              disabled={isSendingVerification}
              variant="outline"
            >
              {isSendingVerification
                ? t('profile:sendingVerification')
                : t('profile:sendVerificationEmail')}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>{t('profile:changePassword')}</CardTitle>
          </div>
          <CardDescription>{t('profile:changePasswordDescription')}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('profile:changePassword')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('profile:changePassword')}</DialogTitle>
                <DialogDescription>
                  {t('profile:changePasswordDialogDescription')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('profile:currentPassword')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('profile:newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth:confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                    disabled={isChangingPassword}
                  >
                    {t('buttons:cancel')}
                  </Button>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? t('profile:changingPassword') : t('buttons:save')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
