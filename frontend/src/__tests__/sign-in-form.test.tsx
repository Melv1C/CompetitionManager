import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../lib/i18n';
import { SignInForm } from '../features/auth/components';

// Basic render test
it('renders sign in form fields', () => {
  render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <SignInForm />
      </I18nextProvider>
    </MemoryRouter>
  );

  expect(screen.getByLabelText(/email/i)).toBeTruthy();
  expect(screen.getByLabelText(/password/i)).toBeTruthy();
});
