# Competition Manager - Backend

A robust Node.js API server built with Hono framework, providing comprehensive competition management capabilities with real-time updates, authentication, and external integrations.

## 🏗️ Architecture

The backend follows a **layered architecture** with clear separation of concerns:

```
backend/
├── src/
│   ├── api.ts              # API app configuration
│   ├── index.ts            # Server entry point
│   ├── data/               # Seed data (JSON files)
│   │   ├── categories.json # Athletic categories
│   │   ├── clubs.json      # Sports clubs
│   │   └── events.json     # Athletic events
│   ├── lib/                # Core libraries
│   │   ├── auth.ts         # Better Auth configuration
│   │   ├── env.ts          # Environment validation
│   │   ├── logger.ts       # Winston logging setup
│   │   ├── prisma.ts       # Prisma client
│   │   └── socket.ts       # Socket.IO configuration
│   ├── middleware/         # HTTP middleware
│   │   ├── access-control.ts # Permission checks
│   │   ├── auth.ts         # Authentication middleware
│   │   └── logger.ts       # Request logging
│   ├── routes/             # API route handlers
│   │   ├── auth.ts         # Authentication routes
│   │   ├── categories.ts   # Category management
│   │   ├── competitions.ts # Competition management
│   │   ├── events.ts       # Event management
│   │   ├── logs.ts         # Log management
│   │   └── index.ts        # Route aggregation
│   ├── services/           # Background services
│   │   ├── athlete-sync.ts # LBFA athlete synchronization
│   │   ├── log-cleanup.ts  # Automated log cleanup
│   │   ├── scheduler.ts    # Cron job scheduler
│   │   ├── seed.ts         # Database seeding
│   │   └── index.ts        # Service manager
│   └── utils/              # Utility functions
│       ├── auth-utils.ts   # Authentication helpers
│       └── log-utils.ts    # Logging utilities
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── generated/              # Generated Prisma client
├── package.json
└── tsconfig.json
```

## 🛠️ Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework for edge computing
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://prisma.io/)
- **Authentication**: [Better Auth](https://better-auth.com/) - Modern auth solution
- **Real-time**: Socket.IO for live updates
- **Validation**: Zod schemas for request/response validation
- **Logging**: Winston with structured logging
- **Scheduling**: Node-cron for background tasks
- **External APIs**: Axios for HTTP requests (LBFA integration)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- PostgreSQL database (via Docker Compose)
- Core package built (`cd ../core && npm run build`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Create and configure your .env file

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5555/postgres
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-long
BETTER_AUTH_URL=http://localhost:5173

# Log Management
LOG_CLEANUP_ENABLED=true
LOG_CLEANUP_DAYS_TO_KEEP=30
LOG_CLEANUP_SCHEDULE=@daily
LOG_CLEANUP_MAX_PER_RUN=1000

# Database Seeding
DB_SEED_ENABLED=true
DB_SEED_FORCE_RESEED=false

# External Integration (LBFA - Belgian Athletics Federation)
ATHLETE_SYNC_ENABLED=true
ATHLETE_SYNC_SCHEDULE=@daily
LBFA_URL=https://api.lbfa.be
LBFA_USERNAME=your-lbfa-username
LBFA_PASSWORD=your-lbfa-password
```

### Available Scripts

```bash
npm run dev     # Start development server with hot reload
npm run build   # Build TypeScript to JavaScript
npm start       # Start production server
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth/**`)

- Handled by Better Auth
- Supports signup, signin, signout
- JWT-based authentication
- Role-based access control

### Categories (`/api/categories`)

- `GET /` - List all categories (public)
- `GET /:id` - Get category by ID (public)
- `POST /` - Create category (admin only)
- `PUT /:id` - Update category (admin only)
- `DELETE /:id` - Delete category (admin only)

### Events (`/api/events`)

- `GET /` - List all events (public)
- `GET /:id` - Get event by ID (public)
- `POST /` - Create event (admin only)
- `PUT /:id` - Update event (admin only)
- `DELETE /:id` - Delete event (admin only)

### Competitions (`/api/competitions`)

- `POST /` - Create competition (organization members)

### Logs (`/api/logs`)

- `GET /` - Query logs with filters (admin only)
- `POST /cleanup` - Trigger manual log cleanup (admin only)

## 🔧 Core Features

### Authentication & Authorization

- **Better Auth Integration**: Modern authentication with JWT tokens
- **Role-based Access**: Admin, organization member, and public access levels
- **Permission System**: Granular permissions for different resources
- **Session Management**: Secure session handling with expiration

### Database Integration

- **Prisma ORM**: Type-safe database operations
- **Migrations**: Version-controlled database schema changes
- **Connection Pooling**: Efficient database connection management
- **Automatic Seeding**: Populate database with initial data

### Real-time Communication

- **Socket.IO**: WebSocket connections for live updates
- **Room Management**: Competition-specific update channels
- **Event Broadcasting**: Real-time notifications for competition changes

### Background Services

#### Log Cleanup Service

- Automatic log rotation based on age
- Configurable retention policies
- Scheduled cleanup tasks
- Manual cleanup triggers

#### Database Seeding

- Populates initial categories, events, and clubs
- Skips existing records to prevent duplicates
- Configurable force-reseed option

#### Athlete Synchronization

- Daily sync with LBFA (Belgian Athletics Federation)
- Automatic athlete and club data updates
- Configurable sync schedules
- Error handling and retry logic

### Logging & Monitoring

- **Structured Logging**: JSON-formatted logs with Winston
- **Request Logging**: HTTP request/response tracking
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking

## 🗄️ Database Schema

The database schema includes:

### Core Entities

- **Users**: Authentication and user management
- **Organizations**: Multi-tenant organization support
- **Members**: Organization membership with roles
- **Sessions**: User session management

### Competition Management

- **Competitions**: Competition details and configuration
- **CompetitionEvents**: Events within competitions
- **Athletes**: Athlete registration and details
- **AthleteInfo**: Season-specific athlete information
- **Clubs**: Sports club information

### Reference Data

- **Events**: Athletic event types (sprint, jump, throw, etc.)
- **Categories**: Age and gender-based categories
- **Logs**: System logging and audit trail

## 🔐 Security

### Authentication

- JWT-based authentication with Better Auth
- Secure password hashing
- Session management with expiration
- Role-based access control

### Data Protection

- SQL injection prevention with Prisma
- Input validation with Zod schemas
- CORS configuration for cross-origin requests
- Environment variable validation

### Permissions

- Admin-level permissions for system management
- Organization-level permissions for competition management
- Granular permissions for different resources

## 🎯 Performance Optimizations

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Prisma query optimization
- **Caching**: Strategic caching of frequently accessed data
- **Async Operations**: Non-blocking I/O operations
- **Error Handling**: Graceful error handling and recovery

## 🔄 External Integrations

### LBFA Integration

- Automatic athlete synchronization
- Club information updates
- License validation
- Configurable sync schedules

## 🧪 Development

### Database Management

```bash
# View database in browser
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name description-of-changes

# Generate client after schema changes
npx prisma generate
```

### Service Management

The service manager handles background services:

- **Initialization**: Starts all enabled services
- **Shutdown**: Graceful service shutdown
- **Health Checks**: Service status monitoring

### Debugging

- Enable debug logging with `NODE_ENV=development`
- Use Prisma Studio for database inspection
- Monitor logs for troubleshooting
- Socket.IO debug mode for real-time debugging

## 🚢 Production Deployment

### Build Process

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Configuration

Ensure production environment variables are set:

- Secure `BETTER_AUTH_SECRET`
- Production database URL
- Proper CORS origins
- External API credentials

### Monitoring

- Monitor application logs
- Set up health checks
- Monitor database performance
- Track API response times

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add comprehensive error handling
3. Include proper logging
4. Write type-safe code with TypeScript
5. Add input validation with Zod
6. Test database operations thoroughly

## 📚 Resources

- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://better-auth.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Winston Logging](https://github.com/winstonjs/winston)
