# Competition Manager - Core

A shared TypeScript package containing common utilities, schemas, types, and validation logic used across the Competition Manager application's backend and frontend.

## 🏗️ Architecture

The core package serves as the **single source of truth** for shared functionality:

```
core/
├── src/
│   ├── index.ts          # Main package exports
│   ├── schemas/          # Zod validation schemas
│   │   ├── index.ts      # Schema exports
│   │   ├── base.ts       # Base primitive schemas
│   │   ├── auth.ts       # Authentication schemas
│   │   ├── athlete.ts    # Athlete-related schemas
│   │   ├── category.ts   # Category schemas
│   │   ├── club.ts       # Club schemas
│   │   ├── competition.ts # Competition schemas
│   │   ├── competition-event.ts # Competition event schemas
│   │   ├── event.ts      # Event schemas
│   │   ├── log.ts        # Logging schemas
│   │   └── organization.ts # Organization schemas
│   ├── types/            # TypeScript type definitions
│   │   ├── index.ts      # Type exports
│   │   └── socket.ts     # Socket.IO event types
│   └── utils/            # Shared utility functions
│       ├── index.ts      # Utility exports
│       ├── permissions.ts # Permission utilities
│       └── organization-permissions.ts # Org permissions
├── dist/                 # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **TypeScript**: Type-safe development
- **Zod**: Runtime type validation and schema generation
- **Better Auth**: Authentication type definitions
- **ESM**: Modern ES module format

## 📦 Package Exports

The package provides three main export paths:

### `/utils` - Utility Functions

```typescript
import {
  hasPermission,
  getOrganizationPermissions,
} from '@competition-manager/core/utils';
```

### `/schemas` - Validation Schemas

```typescript
import { User$, Competition$, Event$ } from '@competition-manager/core/schemas';
```

### `/types` - TypeScript Types

```typescript
import type {
  SocketData,
  ClientToServerEvents,
} from '@competition-manager/core/types';
```

## 🚀 Quick Start

### Installation

This package is installed as a local dependency in both backend and frontend:

```json
{
  "dependencies": {
    "@competition-manager/core": "file:../core"
  }
}
```

### Build Process

The core package must be built before using it in other packages:

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes during development
npm run dev
```

### Available Scripts

```bash
npm run build    # Build TypeScript to JavaScript
npm run dev      # Watch mode for development
npm run clean    # Clean dist directory
```

## 🔧 Core Components

### Base Schemas (`schemas/base.ts`)

Fundamental validation schemas used throughout the application:

```typescript
export const Id$ = z.coerce.number().int().positive();
export const BetterAuthId$ = z.string().regex(/^[A-Za-z0-9]{32}$/);
export const Cuid$ = z.cuid();
export const Date$ = z.coerce.date();
export const Email$ = z.email();
export const Boolean$ = z.union([z.boolean(), z.stringbool()]);
export const Gender$ = z.enum(['M', 'F']);
```

### Authentication Schemas (`schemas/auth.ts`)

User authentication and session management:

```typescript
export const UserRole$ = z.enum(['admin', 'user']);
export const User$ = z.object({
  id: BetterAuthId$,
  name: z.string(),
  email: Email$,
  role: UserRole$.default('user'),
  // ... other user fields
});
```

### Competition Schemas (`schemas/competition.ts`)

Competition and event management:

```typescript
export const Competition$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  startDate: Date$,
  isPublished: Boolean$.default(false),
  // ... other competition fields
});
```

### Socket Types (`types/socket.ts`)

Real-time communication type definitions:

```typescript
export interface ServerToClientEvents {
  error: (data: ErrorData) => void;
  notification: (data: NotificationData) => void;
}

export interface ClientToServerEvents {
  joinCompetition: (data: JoinCompetitionData) => void;
  leaveCompetition: (data: LeaveCompetitionData) => void;
}
```

## 🔐 Permission System

### Permission Utilities (`utils/permissions.ts`)

Role-based access control utilities:

```typescript
export const PERMISSIONS = {
  events: ['create', 'read', 'update', 'delete'],
  categories: ['create', 'read', 'update', 'delete'],
  competitions: ['create', 'read', 'update', 'delete'],
  logs: ['read', 'cleanup'],
} as const;

export function hasPermission(
  userRole: string,
  resource: keyof typeof PERMISSIONS,
  action: string
): boolean {
  // Permission checking logic
}
```

### Organization Permissions (`utils/organization-permissions.ts`)

Organization-level permission management:

```typescript
export const ORGANIZATION_PERMISSIONS = {
  competitions: ['create', 'read', 'update', 'delete'],
  members: ['invite', 'remove', 'update_role'],
} as const;

export function getOrganizationPermissions(
  memberRole: string
): OrganizationPermissions {
  // Organization permission logic
}
```

## 📋 Schema Categories

### Athletic Management

- **Event$**: Athletic event types (sprint, jump, throw, etc.)
- **Category$**: Age and gender-based categories
- **Athlete$**: Athlete information and registration
- **Club$**: Sports club information
- **AthleteInfo$**: Season-specific athlete data

### Competition Management

- **Competition$**: Main competition entity
- **CompetitionEvent$**: Events within competitions
- **Organization$**: Multi-tenant organizations
- **Member$**: Organization membership

### System Management

- **Log$**: Application logging
- **User$**: User authentication
- **Session$**: Session management

## 🎯 Usage Examples

### Schema Validation

```typescript
import { User$, Competition$ } from '@competition-manager/core/schemas';

// Validate user data
const userData = User$.parse(rawUserData);

// Validate competition data
const competitionData = Competition$.parse(rawCompetitionData);

// Create schemas for API endpoints
const CreateCompetition$ = Competition$.omit({ id: true, createdAt: true });
```

### Permission Checking

```typescript
import { hasPermission } from '@competition-manager/core/utils';

// Check if user can create events
if (hasPermission(user.role, 'events', 'create')) {
  // Allow event creation
}

// Check organization permissions
const orgPermissions = getOrganizationPermissions(member.role);
if (orgPermissions.competitions.includes('create')) {
  // Allow competition creation
}
```

### Socket.IO Types

```typescript
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@competition-manager/core/types';

// Backend Socket.IO server
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

// Frontend Socket.IO client
const socket = io<ServerToClientEvents, ClientToServerEvents>();
```

## 🔄 Development Workflow

### Making Changes

1. **Modify Schemas**: Update validation schemas in `src/schemas/`
2. **Update Types**: Add new types in `src/types/`
3. **Add Utilities**: Create shared functions in `src/utils/`
4. **Build Package**: Run `npm run build`
5. **Update Dependents**: Restart backend/frontend dev servers

### Schema Evolution

When updating schemas:

1. **Backward Compatibility**: Consider existing data
2. **Migration Support**: Plan database migrations
3. **Version Awareness**: Document breaking changes
4. **Validation Testing**: Test with real data

### Type Safety

The package ensures type safety across the application:

- **Compile-time Checks**: TypeScript validation
- **Runtime Validation**: Zod schema validation
- **API Contracts**: Consistent data shapes
- **Database Types**: Prisma schema alignment

## 🚢 Build Process

### TypeScript Compilation

```bash
# Single build
npm run build

# Watch mode for development
npm run dev
```

### Output Structure

```
dist/
├── schemas/
│   ├── index.js
│   ├── index.d.ts
│   └── ... (all schema files)
├── types/
│   ├── socket.js
│   └── socket.d.ts
└── utils/
    ├── index.js
    └── index.d.ts
```

### Package Exports

The package.json defines specific export paths:

```json
{
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

## 🔍 Validation Features

### Runtime Validation

Zod schemas provide runtime type checking:

```typescript
// Safe parsing with error handling
const result = User$.safeParse(data);
if (result.success) {
  // Use validated data
  const user = result.data;
} else {
  // Handle validation errors
  console.error(result.error.issues);
}
```

### API Integration

Schemas integrate seamlessly with API validation:

```typescript
// Backend route validation
app.post('/api/users', zValidator('json', UserCreate$), async (c) => {
  const userData = c.req.valid('json'); // Type-safe!
  // ... handle request
});
```

### Database Integration

Schemas align with Prisma database models:

```typescript
// Prisma model matches schema
model User {
  id            String   @id
  name          String
  email         String   @unique
  role          String?
  // ... other fields
}
```

## 🤝 Contributing

### Adding New Schemas

1. Create schema file in `src/schemas/`
2. Export from `src/schemas/index.ts`
3. Add corresponding types if needed
4. Update utilities if required
5. Build and test

### Schema Guidelines

- **Consistent Naming**: Use PascalCase with $ suffix (e.g., `User$`)
- **Comprehensive Validation**: Include all necessary constraints
- **Documentation**: Add JSDoc comments for complex schemas
- **Reusability**: Compose from base schemas when possible

### Type Guidelines

- **Export Types**: Export TypeScript interfaces
- **Naming Consistency**: Match schema names without $ suffix
- **Documentation**: Document complex type relationships

## 📚 Resources

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Better Auth Types](https://better-auth.com/)
- [Socket.IO TypeScript](https://socket.io/docs/v4/typescript/)

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript configuration
2. **Import Errors**: Verify package exports in package.json
3. **Type Mismatches**: Ensure schemas and types align
4. **Validation Failures**: Check Zod schema definitions

### Development Tips

- Always build after schema changes
- Use TypeScript strict mode for better type checking
- Test schemas with real data
- Keep schemas simple and composable
