# Competition Manager

A modern, full-stack competition management system built for athletic organizations to manage competitions, athletes, events, and results.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher (see `.nvmrc` for exact version)
- **Docker & Docker Compose**: For database and containerized deployment
- **PostgreSQL**: Version 16 (or use Docker)

> **Note**: This project includes a `.nvmrc` file. If you use nvm, you can run `nvm use` in the project root to automatically switch to the correct Node.js version.

### Development Setup

1. **Install Dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../core && npm install && npm run build
   cd ../e2e && npm install
   ```

2. **Environment Variables**

   Create `.env` files in the `backend` and `frontend` directories with the necessary configurations:

   - **Backend**: Copy `.env.example` to `.env` and fill in the required values.
   - **Frontend**: Copy `.env.example` to `.env` and set the API URL.

3. **Setup Database**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose -f docker-compose.db.yml up -d

   # Run database migrations
   cd backend
   npx prisma migrate dev
   ```

4. **Start Development Servers**

   ```bash
   # Terminal 1: Backend API (Port 3000)
   cd backend && npm run dev

   # Terminal 2: Frontend App (Port 5173)
   cd frontend && npm run dev

   # Terminal 3: Core Package (for shared types)
   cd core && npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Testing

### End-to-End Tests

The project uses Playwright for comprehensive end-to-end testing.

```bash
# Install test dependencies (if not already done)
cd e2e && npm install

# Run all E2E tests
npm run test

# Run tests in headed mode (with browser UI)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Generate test report
npm run test:report
```

### Running Tests in CI/CD

Tests are automatically run in GitHub Actions via the `e2e-tests.yml` workflow. The tests run against a containerized environment to ensure consistency.

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

## 📁 Package Details

- **[Backend](./backend/README.md)** - API server, database, and business logic
- **[Frontend](./frontend/README.md)** - React application and user interface
- **[Core](./core/README.md)** - Shared utilities, types, and schemas
- **[E2E](./e2e/README.md)** - End-to-end testing suite
