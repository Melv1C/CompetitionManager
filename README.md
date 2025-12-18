# Competition Manager

Full-stack competition management system for athletic organizations.

## Tech Stack

**Backend:** Node 20, Hono, PostgreSQL 16, Prisma · **Frontend:** React 19, Vite, TanStack Query, Zustand, shadcn/ui · **Shared:** Zod, i18next (EN/FR/NL) · **Auth:** Better Auth · **Real-time:** Socket.IO

## Quick Start

```bash
nvm use                    # Use Node 20
npm run install:all        # Install all dependencies
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev                # Start everything
```

**URLs:** Frontend → http://localhost:5173 · Backend → http://localhost:3000

## Scripts

| Command                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | Start all (core, ui, backend, frontend + DB) |
| `npm run dev:desktop-app` | Start desktop app with backend               |
| `npm run docker:db`       | Start PostgreSQL                             |
| `npm run db:migrate:dev`  | Create migration                             |
| `npm run db:migrate`      | Apply migrations                             |
| `npm run lint`            | Lint all packages                            |
| `npm run format`          | Format all packages                          |
| `npm run storybook`       | UI component explorer                        |

## Project Structure

| Folder                   | Description                  |
| ------------------------ | ---------------------------- |
| [`backend/`](backend/)   | API server (Hono + Prisma)   |
| [`frontend/`](frontend/) | Web SPA (React + Vite)       |
| [`core/`](core/)         | Shared types, schemas, utils |
| [`ui/`](ui/)             | Shared UI components         |
| [`desktop/`](desktop/)   | Electron app                 |
