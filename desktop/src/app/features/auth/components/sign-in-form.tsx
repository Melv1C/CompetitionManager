import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { z } from 'zod';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(['auth', 'validation', 'messages']);
  // Create schema with translated messages
  const signInSchema = z.object({
    email: z.string().email({
      message: t('emailInvalid', { ns: 'validation' }),
    }),
    password: z.string().min(8, {
      message: t('passwordMinLength', { ns: 'validation' }),
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
            if (ctx.data.token) {
              localStorage.setItem('bearer_token', ctx.data.token);
            }
            toast.success(t('signInSuccess', { ns: 'messages' }));
          },
          onError: ctx => {
            console.error('Sign in error:', ctx.error);
            form.setError('root', {
              type: 'manual',
              message: ctx.error.message || t('signInError', { ns: 'messages' }),
            });
          },
        },
      );
    } catch (error) {
      console.error('Sign in error:', error);
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
        <CardTitle>{t('signInTitle')}</CardTitle>
        <CardDescription>{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('enterEmail')}
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
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword')}
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
              {isLoading ? t('signingIn') : t('signIn')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
