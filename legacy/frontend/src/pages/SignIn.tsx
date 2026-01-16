import { SignInForm, useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';

export function SignInPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignInForm />
    </div>
  );
}
