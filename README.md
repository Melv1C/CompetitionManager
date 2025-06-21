# Competition Manager

A modern, full-stack competition management system built for athletic organizations to manage competitions, athletes, events, and results.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **Docker & Docker Compose**: For database and containerized deployment
- **PostgreSQL**: Version 16 (or use Docker)

### Development Setup

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd CompetitionManager

   # Install dependencies for all packages
   cd backend && npm install
   cd ../frontend && npm install
   cd ../core && npm install
   cd ../e2e && npm install
   ```

2. **Setup Database**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose -f docker-compose.db.yml up -d

   # Run database migrations
   cd backend
   npx prisma migrate dev
   ```

3. **Start Development Servers**

   ```bash
   # Terminal 1: Backend API (Port 3000)
   cd backend && npm run dev

   # Terminal 2: Frontend App (Port 5173)
   cd frontend && npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🏗️ Architecture

### Tech Stack

- **Backend**: Node.js 20, Hono 3, PostgreSQL 16, Prisma ORM
- **Frontend**: React 19, Vite 5, TanStack Query, Zustand, shadcn/ui
- **Shared**: Zod validation, TypeScript, i18next (EN/FR/NL)
- **Real-time**: Socket.IO
- **Auth**: Better Auth
- **Testing**: Playwright E2E

### Project Structure

```
├── backend/          # API server and business logic
├── frontend/         # React SPA application
├── core/            # Shared types, schemas, and utilities
├── e2e/             # End-to-end tests with Playwright
├── .github/         # CI/CD workflows
└── docker-compose.yml # Container orchestration
```

## 📋 Key Features

### Competition Management

- Create and manage athletic competitions
- Configure events, categories, and participants
- Handle online registrations and payments
- Manage competition schedules and locations

### Organization & User Management

- Multi-tenant organizations with role-based access
- User authentication and authorization
- Organization member management and invitations

### Athlete & Club Management

- Athlete registration and profile management
- Club affiliations and management
- Seasonal athlete information tracking

### Real-time Features

- Live competition updates via Socket.IO
- Real-time notifications and status changes

### Internationalization

- Multi-language support (English, French, Dutch)
- Localized date, time, and number formatting

## 🛠️ Development

### Available Scripts

```bash
# Backend
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server

# Frontend
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build

# Core (Shared Package)
cd core
npm run build    # Build shared package
npm run dev      # Watch mode for development

# E2E Tests
cd e2e
npm run test     # Run all tests
npm run test:ui  # Run tests with UI
```

### Database Management

```bash
cd backend

# Create new migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

### Code Quality

The project includes automated code quality checks:

- **ESLint**: Code linting and formatting
- **TypeScript**: Strict type checking
- **Playwright**: End-to-end testing
- **GitHub Actions**: Automated CI/CD pipeline

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Environment Variables

Create appropriate `.env` files in each package:

- `backend/.env` - Database URLs, API keys, auth secrets
- `frontend/.env` - API endpoints, feature flags

## 📁 Package Details

- **[Backend](./backend/README.md)** - API server, database, and business logic
- **[Frontend](./frontend/README.md)** - React application and user interface
- **[Core](./core/README.md)** - Shared utilities, types, and schemas
- **[E2E](./e2e/README.md)** - End-to-end testing suite

## 🤝 Contributing

1. Follow the coding standards defined in each package
2. Write tests for new features
3. Ensure all CI checks pass
4. Update documentation as needed
