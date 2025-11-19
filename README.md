# Competition Manager

A modern, full-stack competition management system built for athletic organizations to manage competitions, athletes, events, and results.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher (see `.nvmrc` for exact version)
- **Docker & Docker Compose**: For database and containerized deployment
- **PostgreSQL**: Version 16 (or use Docker)

#### Using NVM (Node Version Manager)

This project includes a `.nvmrc` file specifying Node.js version 20. If you use NVM, run this command in the project root to automatically switch to the correct version:

```bash
nvm use
```

If you don't have Node.js 20 installed yet, you can install it with:

```bash
nvm install 20
nvm use
```

### Development Setup

1. **Install Dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install all package dependencies
   npm run install:core
   npm run install:ui
   npm run install:backend
   npm run install:frontend
   npm run install:desktop
   ```

2. **Environment Variables**

   Create `.env` files in the `backend` and `frontend` directories with the necessary configurations:
   - **Backend**: Copy `.env.example` to `.env` and fill in the required values.
   - **Frontend**: Copy `.env.example` to `.env` and set the API URL.

3. **Setup Database**

   ```bash
   # Start PostgreSQL with Docker
   npm run docker:db

   # Run database migrations
   npm run db:migrate
   ```

4. **Start Development**

   ```bash
   # Start all development servers (core, backend, frontend and database)
   npm run dev

   # Or start individually:
   npm run docker:db
   npm run dev:core      # Core package watch mode
   npm run dev:ui        # UI package watch mode
   npm run dev:backend   # Backend API (Port 3000)
   npm run dev:frontend  # Frontend App (Port 5173)
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📝 Available Commands

All commands can be run from the project root:

### Development

- `npm run dev` - Start all development servers (core, backend, frontend, ui)
- `npm run dev:core` - Start core package in watch mode
- `npm run dev:backend` - Start backend API server
- `npm run dev:frontend` - Start frontend development server
- `npm run dev:ui` - Start UI package in watch mode

### Dependencies

- `npm run install:core` - Install core package dependencies
- `npm run install:backend` - Install backend dependencies
- `npm run install:frontend` - Install frontend dependencies
- `npm run install:ui` - Install UI package dependencies
- `npm run install:desktop` - Install desktop app dependencies

### Database

- `npm run db:migrate` - Run Prisma database migrations
- `npm run docker:db` - Start PostgreSQL database with Docker

## 🏗️ Architecture

### Tech Stack

- **Backend**: Node.js 20, Hono 3, PostgreSQL 16, Prisma ORM
- **Frontend**: React 19, Vite 5, TanStack Query, Zustand, shadcn/ui
- **Shared**: Zod validation, TypeScript, i18next (EN/FR/NL)
- **Real-time**: Socket.IO
- **Auth**: Better Auth

### Project Structure

```
├── backend/            # API server and business logic
├── frontend/           # React SPA application
├── core/               # Shared types, schemas, and utilities
├── desktop/            # Desktop application
└── docker-compose.yml  # Container orchestration
```
