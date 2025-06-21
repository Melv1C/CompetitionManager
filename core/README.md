# Core

Shared utilities, types, schemas, and constants for the Competition Manager application. This package serves as the single source of truth for data structures and validation across the entire application.

## 🏗️ Architecture

### Purpose

The `@repo/core` package provides:

- **Zod Schemas**: Input/output validation for API endpoints
- **TypeScript Types**: Shared type definitions
- **Utility Functions**: Common helper functions
- **Constants**: Application-wide constants and enums

### Tech Stack

- **Validation**: Zod v3 for runtime type checking
- **TypeScript**: Strict type definitions
- **Build**: TypeScript compiler with proper exports

### Project Structure

```
src/
├── index.ts              # Main exports
├── schemas/              # Zod validation schemas
│   ├── index.ts          # Schema exports
│   ├── base.ts           # Base schemas and utilities
│   ├── auth.ts           # Authentication schemas
│   ├── organization.ts   # Organization schemas
│   ├── competition.ts    # Competition schemas
│   ├── competition-event.ts # Event schemas
│   ├── athlete.ts        # Athlete schemas
│   ├── club.ts           # Club schemas
│   ├── category.ts       # Category schemas
│   ├── event.ts          # Event type schemas
│   └── log.ts            # Logging schemas
├── types/                # TypeScript type definitions
│   └── socket.ts         # Socket.IO event types
└── utils/                # Utility functions
    └── index.ts          # Common utilities
```

## 📋 Schemas

### Base Schemas

Common validation schemas used throughout the application:

```typescript
// base.ts
export const Id$ = z.number().int().positive();
export const Cuid$ = z.string().cuid();
export const Date$ = z.coerce.date();
export const Boolean$ = z.coerce.boolean();
export const BetterAuthId$ = z.string().min(1);
```

### Entity Schemas

#### Organization Schema

```typescript
export const Organization$ = z.object({
  id: BetterAuthId$,
  name: z.string().min(1),
  slug: z.string().nullish(),
  logo: z.string().nullish(),
  createdAt: Date$,
  // ... additional fields
});

export type Organization = z.infer<typeof Organization$>;
```

#### Competition Schema

```typescript
export const Competition$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  startDate: Date$,
  endDate: Date$.nullish(),
  isPublished: Boolean$.default(false),
  description: z.string().default(''),
  location: z.string().default(''),
  // ... configuration fields
});

export type Competition = z.infer<typeof Competition$>;
```

### API Schemas

Request and response schemas for API endpoints:

```typescript
// Create competition request
export const CreateCompetitionRequest$ = Competition$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
});

// Competition list response
export const CompetitionListResponse$ = z.array(
  Competition$.extend({
    organization: Organization$.pick({ name: true, slug: true }),
    _count: z.object({
      events: z.number(),
      athletes: z.number(),
    }),
  })
);
```

## 🔧 Usage

### In Backend (API Validation)

```typescript
import { Competition$, CreateCompetitionRequest$ } from '@repo/core/schemas';
import { zValidator } from '@hono/zod-validator';

// Route handler with validation
app.post(
  '/competitions',
  zValidator('json', CreateCompetitionRequest$),
  async (c) => {
    const data = c.req.valid('json'); // Type-safe data
    // ... handle request
  }
);

// Database result validation
const competition = Competition$.parse(dbResult);
```

### In Frontend (Type Safety)

```typescript
import type { Competition, CreateCompetitionRequest } from '@repo/core/schemas';
import { CreateCompetitionRequest$ } from '@repo/core/schemas';

// Type-safe API calls
const createCompetition = async (
  data: CreateCompetitionRequest
): Promise<Competition> => {
  // Validate before sending
  const validData = CreateCompetitionRequest$.parse(data);

  const response = await api.post('/competitions', validData);
  return Competition$.parse(response.data);
};

// Form validation
const formSchema = CreateCompetitionRequest$.extend({
  // Additional frontend-only fields
  confirmPassword: z.string(),
});
```

## 🏷️ Types

### Socket.IO Event Types

```typescript
// types/socket.ts
export interface ServerToClientEvents {
  competitionUpdate: (data: CompetitionUpdateEvent) => void;
  athleteRegistered: (data: AthleteRegistrationEvent) => void;
  notification: (data: NotificationEvent) => void;
}

export interface ClientToServerEvents {
  joinCompetition: (competitionId: string) => void;
  leaveCompetition: (competitionId: string) => void;
}
```

### Database Types

```typescript
// Prisma-compatible types
export type PrismaCompetition = Prisma.CompetitionGetPayload<{
  include: {
    organization: true;
    events: true;
    athletes: true;
  };
}>;
```

## 🛠️ Utilities

### Common Helper Functions

```typescript
// utils/index.ts
export const formatDate = (date: Date, locale = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale).format(date);
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Schema Utilities

```typescript
// Schema composition helpers
export const withPagination = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Usage
const PaginatedCompetitions$ = withPagination(Competition$);
```

## 📦 Build & Distribution

### Package Configuration

```json
{
  "name": "@repo/core",
  "exports": {
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js"
    },
    "./schemas": {
      "types": "./dist/schemas/index.d.ts",
      "import": "./dist/schemas/index.js"
    },
    "./types": {
      "types": "./dist/types/socket.d.ts",
      "import": "./dist/types/socket.js"
    }
  }
}
```

### Development

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check
```

### Import Examples

```typescript
// Import schemas
import { Competition$, CreateCompetitionRequest$ } from '@repo/core/schemas';

// Import types
import type { Competition, ServerToClientEvents } from '@repo/core/types';

// Import utilities
import { formatDate, generateSlug } from '@repo/core/utils';
```

## 🔄 Schema Evolution

### Adding New Schemas

1. **Create the schema file** in `src/schemas/`
2. **Export from index.ts**
3. **Add type exports** for TypeScript support
4. **Update dependent packages** (backend/frontend)

### Versioning Strategy

- **Breaking Changes**: Bump major version
- **New Fields**: Bump minor version (with `.optional()` or `.default()`)
- **Bug Fixes**: Bump patch version

### Migration Patterns

```typescript
// Backward-compatible field addition
export const UserV2$ = UserV1$.extend({
  newField: z.string().optional(), // Safe addition
});

// Schema transformation for breaking changes
export const migrateUserV1ToV2 = (v1: UserV1): UserV2 => ({
  ...v1,
  newField: 'default-value',
});
```

## 🧪 Testing Schemas

### Validation Testing

```typescript
import { describe, it, expect } from 'vitest';
import { Competition$ } from './competition';

describe('Competition Schema', () => {
  it('should validate valid competition data', () => {
    const validData = {
      id: 1,
      eid: 'cuid123',
      name: 'Test Competition',
      startDate: new Date(),
      isPublished: false,
      // ...
    };

    expect(() => Competition$.parse(validData)).not.toThrow();
  });

  it('should reject invalid competition data', () => {
    const invalidData = {
      id: 'not-a-number', // Should be number
      name: '', // Should not be empty
    };

    expect(() => Competition$.parse(invalidData)).toThrow();
  });
});
```

## 📝 Best Practices

### Schema Design

1. **Use descriptive names** for schemas and fields
2. **Provide default values** where appropriate
3. **Use `.optional()` for non-required fields**
4. **Compose schemas** rather than duplicating
5. **Document complex validation logic**

### Type Safety

1. **Always infer types** from schemas using `z.infer<>`
2. **Export both schemas and types**
3. **Use const assertions** for literal types
4. **Validate at boundaries** (API, database, external services)

### Performance

1. **Reuse schema instances** rather than recreating
2. \*\*Use `.partial()` and `.pick()` for derived schemas
3. **Avoid deep nesting** in complex schemas
4. **Cache parsed results** when appropriate

## 🔗 Dependencies

### Core Dependencies

- **zod**: Runtime validation and type inference
- **typescript**: Type definitions and compilation

### Peer Dependencies

- Used by backend and frontend packages
- Socket.IO types (for real-time features)
- Prisma types (for database integration)
