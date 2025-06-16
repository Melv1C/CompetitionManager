import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { SignInForm } from '@/features/auth/components';
import i18n from '@/lib/i18n';

// Mock auth client to prevent network calls
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Set up i18n for testing with real translations
beforeAll(async () => {
  // Wait for i18n to be ready
  await i18n.loadLanguages(['en']);
  await i18n.changeLanguage('en');
});

// Test wrapper that provides all necessary contexts
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </MemoryRouter>
  );
}

describe('SignInForm', () => {
  it('renders sign in form fields', () => {
    render(
      <TestWrapper>
        <SignInForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.getByText(/don't have an account\?/i)).toBeTruthy();
  });
});
