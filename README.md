# Competition Manager

A comprehensive competition management system built with modern web technologies for organizing and managing athletic competitions. The system supports multi-organization management, athlete tracking, event scheduling, and real-time updates.

## 🏗️ Architecture

This project follows a **monorepo architecture** with three main packages:

```
competition-manager/
├── backend/          # Node.js API server (Hono + PostgreSQL)
├── frontend/         # React SPA (Vite + TypeScript)
├── core/             # Shared utilities, schemas, and types
└── docker-compose.yml # PostgreSQL database setup
```

## 🛠️ Tech Stack

### Backend

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Database**: PostgreSQL with [Prisma ORM](https://prisma.io/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Real-time**: Socket.IO for live updates
- **Validation**: Zod schemas
- **Runtime**: Node.js with TypeScript

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand + TanStack Query
- **UI Components**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next

### Core Package

- **Shared Types**: TypeScript definitions
- **Validation Schemas**: Zod schemas for data validation
- **Utilities**: Common functions and permissions system

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18
- **Docker** and **Docker Compose** (for database)
- **npm**

### 1. Database Setup

Start the PostgreSQL database:

```bash
docker-compose up -d
```

### 2. Install Dependencies

Install dependencies for all packages:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install core package dependencies
cd ../core && npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5555/postgres
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:5173

# Log cleanup configuration
LOG_CLEANUP_ENABLED=true
LOG_CLEANUP_DAYS_TO_KEEP=30
LOG_CLEANUP_SCHEDULE=@daily

# Database seeding
DB_SEED_ENABLED=true
DB_SEED_FORCE_RESEED=false

# Athlete sync with LBFA (Belgian Athletics Federation)
ATHLETE_SYNC_ENABLED=true
ATHLETE_SYNC_SCHEDULE=@daily
ATHLETE_SYNC_USE_MOCK=false
LBFA_URL=https://api.lbfa.be
LBFA_USERNAME=your-lbfa-username
LBFA_PASSWORD=your-lbfa-password
```

### 4. Database Migration

Run Prisma migrations to set up the database schema:

```bash
cd backend
npx prisma migrate deploy
```

### 5. Build Core Package

The core package needs to be built first as it's used by both backend and frontend:

```bash
cd core
npm run build
```

### 6. Start Development Servers

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend development server:

```bash
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Database**: localhost:5555 (PostgreSQL)

## 📱 Features

### Core Features

- **Multi-organization Management**: Support for multiple sports organizations
- **Competition Management**: Create and manage athletic competitions
- **Event & Category Management**: Organize events by categories and age groups
- **Athlete Management**: Track athletes with license numbers and club affiliations
- **Real-time Updates**: Live updates using Socket.IO
- **Role-based Access Control**: Admin and organization-level permissions

### Admin Features

- **User Management**: Manage users and their permissions
- **System Monitoring**: View logs and system analytics
- **Database Management**: Manage events, categories, and clubs
- **Organization Oversight**: Monitor all organizations in the system

### Organization Features

- **Competition Creation**: Create and manage competitions
- **Member Management**: Manage organization members and roles
- **Analytics Dashboard**: View competition and member statistics
- **Settings Management**: Configure organization preferences

## 🏃‍♂️ Development

### Project Structure

Each package has its own detailed README with specific setup instructions:

- [`backend/README.md`](./backend/README.md) - API server setup and architecture
- [`frontend/README.md`](./frontend/README.md) - React application setup and components
- [`core/README.md`](./core/README.md) - Shared utilities and schemas

### Development Workflow

1. **Core Development**: Make changes to shared types/schemas in `core/`
2. **Build Core**: Run `npm run build` in `core/` after changes
3. **Backend Development**: API endpoints, services, and database operations
4. **Frontend Development**: UI components and user interactions
5. **Testing**: Test changes across all packages

### Database Management

- **View Data**: Use Prisma Studio: `cd backend && npx prisma studio`
- **Reset Database**: `cd backend && npx prisma migrate reset`
- **Generate Types**: `cd backend && npx prisma generate`

### External Integration

The system integrates with **LBFA** (Belgian Athletics Federation) for athlete synchronization:

- Automatic daily sync of athlete data
- Club information synchronization
- License validation

## 🛡️ Security

- **Authentication**: JWT-based auth with Better Auth
- **Authorization**: Role-based permissions (Admin/Organization/Member)
- **Data Validation**: Comprehensive Zod schemas
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **CORS Configuration**: Proper cross-origin setup

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with multiple levels
- **Log Cleanup**: Automated log rotation and cleanup
- **Error Tracking**: Comprehensive error logging and handling
- **Performance Monitoring**: Request timing and performance metrics

## 🚢 Deployment

### Production Build

```bash
# Build core package
cd core && npm run build

# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

### Environment Variables

Ensure all production environment variables are properly configured, especially:

- Database connection strings
- Authentication secrets
- External API credentials (LBFA)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly across all packages
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:

- Check the individual package READMEs for detailed information
- Review the code comments and documentation
- Open an issue for bugs or feature requests

---

Built with ❤️ for athletic competition management
