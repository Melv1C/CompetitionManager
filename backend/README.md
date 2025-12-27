# Backend

API server built with Hono, Prisma ORM, and PostgreSQL.

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Compile TypeScript
npm run start    # Run production build
npm run email    # Preview email templates
```

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable                    | Description                  |
| --------------------------- | ---------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string |
| `BETTER_AUTH_SECRET`        | Auth secret (min 32 chars)   |
| `FRONTEND_URL`              | Frontend URL for CORS        |
| `STRIPE_SECRET_KEY`         | Stripe API key               |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials             |
| `CRON_SECRET`               | Secret key for cron jobs     |
