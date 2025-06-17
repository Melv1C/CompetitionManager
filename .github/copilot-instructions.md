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
core/         – shared TS types, Zod schemas, helpers

```

## 3. Coding Standards  
### 3.1 TypeScript  
- **strict** compiler flags **ON**; no `any`, `unknown`, or implicit `any`.  
- Prefer **type predicates** and **exhaustive switch** for narrowing.  
- Utility types live in `core/ts/`.

### 3.2 React & Vite  
- Functional components only.  
- Files **≤ 300 lines**; split hooks/components when exceeded.  
- Use `tailwind-merge` for class composition; no inline styles except quick prototypes.  
- All UI must be **mobile-first** (min width 320 px) and fully keyboard navigable.

### 3.3 Node & Hono  
- Route handlers **≤ 75 LoC**; move logic to services.  
- Async/await; no `.then` chains.  
- Validate every inbound payload with shared Zod schema.

## 4. Quality Gates  
- Run `pnpm lint && pnpm test` before proposing code.  
- All new code **must** ship at least **1 Jest/RTL test** and **1 Playwright e2e** where applicable.  
- Enforce **Prettier** + **ESLint** (extends `eslint-config-turbo`) autofix.

## 5. UX & Accessibility  
- Follow **WCAG 2.2 AA**.  
- Use Radix primitives for dialogs, menus, tooltips.  
- Prefer progressive enhancement; features should work with JS disabled when feasible.

## 6. Testing & CI  
- Unit tests live alongside code (`*.test.ts[x]`).  
- e2e resides in `tests/`.  
- GitHub Actions pipeline: `ci.yml` installs deps, runs lint, type-check, test matrices.

## 7. MCP / External Tools  
Copilot agent may call approved MCP servers described in **docs/mcp-integrations.md**