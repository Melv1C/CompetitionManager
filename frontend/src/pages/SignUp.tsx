import { SignUpForm } from '@/features/auth';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

export function SignUpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignUpForm />
    </div>
  );
}
