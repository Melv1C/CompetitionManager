import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@repo/ui/styles';
import './lib/i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
