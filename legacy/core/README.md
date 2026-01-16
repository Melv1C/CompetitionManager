# Core

Shared TypeScript types, Zod schemas, and utilities used by all packages.

## Scripts

```bash
npm run dev    # Watch mode
npm run build  # Compile to dist/
```

## Usage

```ts
import { ... } from '@repo/core/types'
import { ... } from '@repo/core/schemas'
import { ... } from '@repo/core/utils'
```

## Structure

```
src/
├── types/    # TypeScript interfaces
├── schemas/  # Zod validation schemas
└── utils/    # Shared utilities
```
