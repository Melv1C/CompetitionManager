import { GoogleIcon } from '@/components/icons/google-icon';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { env } from '@/lib/env';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Create schema with translated messages
  const signInSchema = z.object({
    email: z.email({
      message: t('validation:emailInvalid'),
    }),
    password: z.string().min(8, {
      message: t('validation:passwordMinLength'),
    }),
  });

  type SignInFormValues = z.infer<typeof signInSchema>;

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    setIsLoading(true);

    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            // Loading state is already handled above
          },
          onSuccess: ctx => {
            if (env.VITE_USE_BEARER) {
              if (ctx.data.token) {
                localStorage.setItem('bearer_token', ctx.data.token);
              }
            }
            toast.success(t('messages:signInSuccess'));
            navigate('/');
          },
          onError: ctx => {
            console.error('Sign in error:', ctx.error);
            form.setError('root', {
              type: 'manual',
              message: ctx.error.message || t('messages:signInError'),
            });
          },
        },
      );
    } catch (error) {
      console.error('Sign in error:', error);
      form.setError('root', {
        type: 'manual',
        message: t('messages:unexpectedError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth:signInTitle')}</CardTitle>
        <CardDescription>{t('auth:signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('auth:enterEmail')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('auth:password')}</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() => navigate('/forgot-password')}
                    >
                      {t('auth:forgotPassword')}
                    </Button>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth:enterPassword')}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <div className="text-sm text-destructive">{form.formState.errors.root.message}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth:signingIn') : t('auth:signIn')}
            </Button>

            {env.VITE_HAS_GOOGLE_AUTH && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await authClient.signIn.social({ provider: 'google' });
                  }}
                  disabled={isLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  {t('auth:signInWithGoogle')}
                </Button>
              </>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t('auth:dontHaveAccount')}{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth/sign-up')}>
            {t('auth:signUp')}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
