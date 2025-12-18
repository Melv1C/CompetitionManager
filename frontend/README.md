# Frontend

React SPA with Vite, TanStack Query, Zustand, and shadcn/ui.

## Scripts

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run i18n     # Check translation keys
npm run i18n:ci  # CI translation check
```

## Environment Variables

Copy `.env.example` to `.env`.

| Variable                  | Description           |
| ------------------------- | --------------------- |
| `VITE_API_URL`            | Backend API URL       |
| `VITE_USE_BEARER`         | Use Bearer token auth |
| `VITE_HAS_GOOGLE_AUTH`    | Enable Google OAuth   |
| `VITE_SHOW_SOCKET_STATUS` | Show Socket.IO status |
