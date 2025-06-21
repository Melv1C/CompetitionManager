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
import { zodResolver } from '@hookform/resolvers/zod';
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
        message: t('nameMinLength', { ns: 'validation' }),
      }),
      email: z.string().email({
        message: t('emailInvalid', { ns: 'validation' }),
      }),
      password: z.string().min(8, {
        message: t('passwordMinLength', { ns: 'validation' }),
      }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsNoMatch', { ns: 'validation' }),
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
          onSuccess: () => {
            toast.success(t('accountCreatedSuccess', { ns: 'messages' }));
            navigate('/');
          },
          onError: (ctx) => {
            console.error('Sign up error:', ctx.error);
            form.setError('root', {
              type: 'manual',
              message:
                ctx.error.message || t('signUpError', { ns: 'messages' }),
            });
          },
        }
      );
    } catch (error) {
      console.error('Sign up error:', error);
      form.setError('root', {
        type: 'manual',
        message: t('unexpectedError', { ns: 'messages' }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('signUpTitle', { ns: 'auth' })}</CardTitle>
        <CardDescription>
          {t('signUpDescription', { ns: 'auth' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name', { ns: 'auth' })}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('enterFullName', { ns: 'auth' })}
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
                  <FormLabel>{t('email', { ns: 'auth' })}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('enterEmail', { ns: 'auth' })}
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
                  <FormLabel>{t('password', { ns: 'auth' })}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword', { ns: 'auth' })}
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
                  <FormLabel>{t('confirmPassword', { ns: 'auth' })}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('confirmYourPassword', { ns: 'auth' })}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? t('creatingAccount', { ns: 'auth' })
                : t('signUp', { ns: 'auth' })}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t('alreadyHaveAccount', { ns: 'auth' })}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate('/auth/sign-in')}
          >
            {t('signIn', { ns: 'auth' })}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
