# Competition Manager – Repository Rules

## 1. Tech Stack Snapshot  
- **Backend**: Node 20, Hono 3, PostgreSQL 16 via Prisma ORM  
- **Frontend**: React 19, Vite 5, Zustand + TanStack Query, shadcn/ui (Radix UI + Tailwind CSS v4)  
- **Shared**: Zod for validation, i18next (EN | FR | NL)  
- **Real-time**: Socket.IO  
- **Auth**: Better Auth

## 2. Repository Topology  
```

backend/      – API routes, services, prisma schema
frontend/     – SPA source (src/routes, src/components, src/pages)
core/         – shared TS types, Zod schemas, and utility functions
tests/        – end-to-end tests

```

## 3. Coding Standards  
### 3.1 TypeScript  
- **strict** compiler flags **ON**; no `any`, `unknown`, or implicit `any`.  
- Prefer **type predicates** and **exhaustive switch** for narrowing.  
- Async/await for all async functions; no `.then()` chaining.
- Use **Zod** for all data validation. 

### 3.2 React & Vite  
- Functional components only.  
- Files **≤ 300 lines**; split hooks/components when exceeded.
- Use **Zod** for all data validation from API responses.
- Use **TanStack Query** for data fetching and caching.
- Use **Zustand** for global state management.
- Use **shadcn/ui** for UI components (Radix UI + Tailwind CSS v4). The components are located in `frontend/src/components/ui/` and should not be modified directly.
- Use **i18next** for internationalization (EN | FR | NL).
- Use **Tailwind CSS v4** for styling; no inline styles.

### 3.3 Node & Hono  
- Route handlers **≤ 75 LoC**; move logic to services.  
- Validate every input and output with **Zod**.
- Use **Prisma** for database access; no raw SQL queries.
- Use **Socket.IO** for real-time features.
- Use **Better Auth** for authentication and authorization.

### 3.4 Core
- **Shared schemas** in `core/schemas/`.
- **Shared types** in `core/types/`.
- **Shared utils** in `core/utils/`.

## 4. Testing & CI  
- e2e resides in `tests/`.  
- GitHub Actions pipeline: `code-quality.yml` and `e2e-tests.yml`. 