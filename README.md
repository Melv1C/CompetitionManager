# Fullstack Turbo Kit

A production-ready [Turborepo](https://turbo.build/repo) monorepo starter with full-stack applications and shared packages.

## What's Inside?

### Apps

- **backend** — [Hono](https://hono.dev/) API server
- **frontend** — [Vite](https://vitejs.dev/) + [React](https://react.dev/) application
- **admin** — Vite + React admin application

### Packages

- **@repo/api-client** — Shared API client for frontend-backend communication
- **@repo/utils** — Shared utility functions and constants
- **@repo/eslint-config** — ESLint configurations
- **@repo/typescript-config** — TypeScript configurations
- **@repo/ui** — Shared UI components and design system

All packages and apps are written in [TypeScript](https://www.typescriptlang.org/).

## Getting Started

Install dependencies:

```bash
npm install
```

### Development

Run all apps in development mode:

```bash
npm run dev
```

## CI/CD

This project includes GitHub Actions workflows for:

- **Pipeline** — Installation, linting, type checking, and testing + staging deployment on push to `main` branch
- **Release** — Automated versioning and release process

## Release Process

Create a new release using semantic versioning:

```bash
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

## Project Structure

```
apps/
  ├── admin/            # Vite + React admin app
  ├── backend/          # Hono API server
  └── frontend/         # Vite + React app
packages/
  ├── api-client/       # Shared API client for frontend-backend communication
  ├── ui/               # Shared UI components
  ├── utils/            # Shared utilities
  ├── eslint-config/    # ESLint configurations
  └── typescript-config/ # TypeScript configurations
```

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Hono Documentation](https://hono.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
