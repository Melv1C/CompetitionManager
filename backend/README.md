# Backend

The backend service for Competition Manager - a REST API built with Hono, PostgreSQL, and Prisma.

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Hono 3 (lightweight web framework)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: Better Auth
- **Validation**: Zod schemas from `@repo/core`
- **Real-time**: Socket.IO
- **Logging**: Winston

### Project Structure

```
src/
├── index.ts              # Application entry point
├── api.ts               # API router configuration
├── routes/              # API route handlers
│   ├── auth.ts          # Authentication endpoints
│   ├── competitions.ts   # Competition management
│   ├── categories.ts    # Competition categories
│   ├── clubs.ts         # Club management
│   ├── events.ts        # Event management
│   ├── logs.ts          # System logging
│   └── organization/    # Organization management
├── services/            # Background services
│   ├── athlete-sync.ts  # Athlete data synchronization
│   ├── log-cleanup.ts   # Log maintenance
│   ├── scheduler.ts     # Task scheduling
│   └── seed.ts          # Database seeding
├── middleware/          # Custom middleware
├── lib/                 # Utility libraries
├── data/               # Static data and migrations
└── utils/              # Helper utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

The API server will be available at `http://localhost:3000`

## 🗄️ Database

### Schema Overview

The database schema includes the following main entities:

- **User & Authentication**: User accounts, sessions, and organization membership
- **Organizations**: Multi-tenant organization management
- **Competitions**: Competition setup and configuration
- **Events & Categories**: Athletic events and age/gender categories
- **Athletes & Clubs**: Participant and club management
- **Logs**: System logging and audit trails

### Key Models

#### Competition Management

```typescript
Competition {
  id: Int
  eid: String          # External ID
  name: String
  startDate: DateTime
  endDate: DateTime?
  isPublished: Boolean
  description: String
  location: String
  // ... configuration fields
}
```

#### Event Management

```typescript
CompetitionEvent {
  id: Int
  eid: String
  name: String
  eventStartTime: DateTime
  maxParticipants: Int?
  price: Float
  // ... relations to Event and Category
}
```

### Database Commands

```bash
# Create new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Generate client after schema changes
npx prisma generate
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/sign-in` - User sign in
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User sign out
- `GET /api/auth/session` - Get current session

### Organizations

- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization
- `PUT /api/organizations/:id` - Update organization

### Competitions

- `GET /api/competitions` - List competitions
- `POST /api/competitions` - Create competition
- `GET /api/competitions/:id` - Get competition details
- `PUT /api/competitions/:id` - Update competition
- `DELETE /api/competitions/:id` - Delete competition

### Events & Categories

- `GET /api/events` - List available events
- `GET /api/categories` - List competition categories
- `POST /api/competitions/:id/events` - Add event to competition

### Clubs & Athletes

- `GET /api/clubs` - List clubs
- `POST /api/clubs` - Create club
- `GET /api/athletes` - List athletes
- `POST /api/athletes` - Register athlete

## 🔧 Services

### Background Services

#### Athlete Sync Service

Synchronizes athlete data from external sources and maintains data consistency.

#### Log Cleanup Service

Automatically removes old log entries to manage database size.

#### Scheduler Service

Manages scheduled tasks and background job processing.

#### Seed Service

Populates the database with initial data for development and testing.

## 🌐 Socket.IO

Real-time functionality powered by Socket.IO:

- **Competition Updates**: Live updates during competitions
- **Registration Status**: Real-time registration confirmations
- **Notifications**: Instant notifications for important events

## 🔐 Authentication & Authorization

### Better Auth Integration

- Session-based authentication
- Role-based access control (RBAC)
- Organization-scoped permissions
- Secure password handling

### Permission Levels

- **Admin**: Full system access
- **Organization Admin**: Organization-wide management
- **Member**: Basic organization access
- **Public**: Read-only access to published content

## 📝 Logging

Winston-based logging with structured logs:

- **Error Level**: System errors and exceptions
- **Warn Level**: Warning conditions
- **Info Level**: General information
- **Debug Level**: Detailed debugging information

Logs are stored in the database and can be queried via the API.

## 🧪 Testing

```bash
# Run unit tests (if configured)
npm test

# Run integration tests with database
npm run test:integration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/competition_manager"

# Server
PORT=3000
NODE_ENV=development

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# External APIs (if applicable)
EXTERNAL_API_KEY="your-api-key"
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t competition-manager-backend .

# Run with Docker Compose
docker-compose up backend
```

### Production Considerations

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database Migrations**: Run migrations before deployment
3. **SSL/TLS**: Configure HTTPS in production
4. **Monitoring**: Set up logging and monitoring
5. **Backup**: Regular database backups

## 🛠️ Development Tips

### Code Organization

- Keep route handlers under 75 lines of code
- Move business logic to services
- Use Zod for all input/output validation
- Follow TypeScript strict mode

### Database Best Practices

- Use Prisma migrations for schema changes
- Index frequently queried fields
- Use transactions for multi-step operations
- Implement soft deletes where appropriate

### Performance

- Use database connection pooling
- Implement caching for frequently accessed data
- Optimize N+1 query problems with Prisma includes
- Monitor query performance
