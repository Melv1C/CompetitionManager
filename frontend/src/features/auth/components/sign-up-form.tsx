import { authClient } from '@/lib/auth-client';
import { env } from '@/lib/env';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  GoogleIcon,
  Input,
} from '@repo/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const signUpSchema = z
    .object({
      name: z.string().min(2, {
        message: t('validation:nameMinLength'),
      }),
      email: z.email({
        message: t('validation:emailInvalid'),
      }),
      password: z.string().min(8, {
        message: t('validation:passwordMinLength'),
      }),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('validation:passwordsNoMatch'),
      path: ['confirmPassword'],
    });

  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);

    try {
      await authClient.signUp.email(
        {
          name: values.name,
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
            toast.success(t('messages:accountCreatedSuccess'));
            navigate('/');
          },
          onError: ctx => {
            console.error('Sign up error:', ctx.error);
            form.setError('root', {
              type: 'manual',
              message: ctx.error.message || t('messages:signUpError'),
            });
          },
        },
      );
    } catch (error) {
      console.error('Sign up error:', error);
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
        <CardTitle>{t('auth:signUpTitle')}</CardTitle>
        <CardDescription>{t('auth:signUpDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:name')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('auth:enterFullName')}
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
                  <FormLabel>{t('auth:password')}</FormLabel>
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth:confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth:confirmYourPassword')}
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
              {isLoading ? t('auth:creatingAccount') : t('auth:signUp')}
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
          {t('auth:alreadyHaveAccount')}{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth/sign-in')}>
            {t('auth:signIn')}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
