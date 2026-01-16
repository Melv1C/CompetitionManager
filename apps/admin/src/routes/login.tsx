import { signIn } from '@/lib/auth-client';
import { LoginForm } from '@melv1c/ui-kit';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    console.log('Attempting login with', email);
    const result = await signIn.email({ email, password });
    if (result.error) {
      throw new Error(result.error.message);
    }
    navigate({ to: '/' });
  };

  // const handleProviderLogin = async (provider: LoginProvider) => {
  //   await signIn.social({ provider });
  // };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm
        title="Admin Login"
        description="Sign in to access the admin dashboard"
        onSubmit={handleSubmit}
        showForgotPassword={false}
        showSignUp={false}
      />
    </div>
  );
}
