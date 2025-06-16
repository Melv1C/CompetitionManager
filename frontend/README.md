# Competition Manager - Frontend

A modern React application built with Vite and TypeScript, providing a comprehensive user interface for competition management with real-time updates, internationalization, and responsive design.

## 🏗️ Architecture

The frontend follows a **feature-based architecture** with clear separation of concerns:

```
frontend/
├── src/
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # App entry point
│   ├── index.css           # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Layout components
│   │   │   ├── admin-layout.tsx
│   │   │   ├── admin-skeleton.tsx
│   │   │   ├── main-layout.tsx
│   │   │   ├── organization-layout.tsx
│   │   │   └── organization-skeleton.tsx
│   │   └── ui/             # Base UI components (Radix UI + Tailwind)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       └── ... (shadcn/ui components)
│   ├── features/           # Feature-specific modules
│   │   ├── auth/           # Authentication
│   │   ├── categories/     # Category management
│   │   ├── events/         # Event management
│   │   ├── logs/           # Log viewing
│   │   ├── organization/   # Organization management
│   │   └── theme/          # Theme management
│   ├── hooks/              # Shared custom hooks
│   ├── lib/                # Core libraries and utilities
│   │   ├── api-client.ts   # Axios configuration
│   │   ├── auth-client.ts  # Better Auth client
│   │   ├── i18n.ts         # Internationalization setup
│   │   └── utils.ts        # Utility functions
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   ├── organization/   # Organization pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── NotFound.tsx    # 404 page
│   │   ├── SignIn.tsx      # Sign in page
│   │   └── SignUp.tsx      # Sign up page
│   ├── store/              # Global state management
│   └── translations/       # i18n translation files
├── public/                 # Static assets
│   ├── logo-black.png
│   └── logo-white.png
├── components.json         # shadcn/ui configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ Tech Stack

### Core Framework

- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

### UI & Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI primitives
- **shadcn/ui**: Beautiful, customizable components
- **Lucide React**: Icon library
- **React Scan**: Development performance monitoring

### State Management

- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form state management

### Routing & Navigation

- **React Router v7**: Client-side routing
- **React Router DOM**: DOM bindings

### Authentication

- **Better Auth**: Modern authentication client
- **JWT Tokens**: Secure authentication

### Internationalization

- **i18next**: Internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

### Real-time & API

- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client for API calls

### Development Tools

- **ESLint**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting
- **Vite**: Development server and build tool

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Backend server running (see backend README)
- Core package built (`cd ../core && npm run build`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Server

The development server will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api (must be running)

## 🎨 Design System

### UI Components

The application uses **shadcn/ui** components built on top of **Radix UI** primitives:

- **Buttons**: Various styles and sizes
- **Cards**: Content containers
- **Tables**: Data display with sorting/filtering
- **Forms**: Form inputs with validation
- **Dialogs**: Modal windows
- **Dropdowns**: Selection menus
- **Sidebars**: Navigation panels
- **Skeletons**: Loading states

### Theme System

- **Dark/Light Mode**: Automatic theme switching
- **System Preference**: Respects user's OS preference
- **Persistent**: Theme choice saved in localStorage
- **Smooth Transitions**: Animated theme changes

### Responsive Design

- **Mobile-first**: Designed for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Adaptive Layout**: Layouts adjust to screen size
- **Touch-friendly**: Optimized for touch interactions

## 🔐 Authentication Flow

### Public Routes

- `/` - Landing page
- `/login` - Sign in page
- `/signup` - Sign up page
- `/competitions` - Public competition listings

### Protected Routes

#### Admin Routes (`/admin`)

- Requires admin role
- System-wide management capabilities
- User and organization management
- System logs and analytics

#### Organization Routes (`/organization`)

- Requires organization membership
- Organization-specific management
- Competition creation and management
- Member management

### Authentication States

- **Loading**: Skeleton components during auth check
- **Authenticated**: Access to protected routes
- **Unauthenticated**: Redirect to login
- **Insufficient Permissions**: Redirect to appropriate page

## 🌟 Features

### User Management

- **Sign Up/Sign In**: Email-based authentication
- **Profile Management**: User profile editing
- **Role-based Access**: Different UI based on user role
- **Session Management**: Automatic session handling

### Admin Features

- **Dashboard**: System overview and statistics
- **User Management**: View and manage all users
- **Organization Management**: Create and manage organizations
- **Database Management**: Events, categories, and clubs
- **System Logs**: View and filter system logs
- **Analytics**: System-wide analytics and reporting

### Organization Features

- **Dashboard**: Organization-specific overview
- **Competition Management**: Create and manage competitions
- **Member Management**: Invite and manage members
- **Analytics**: Organization-specific analytics
- **Settings**: Organization configuration

### Real-time Features

- **Live Updates**: Real-time competition updates
- **Notifications**: Toast notifications for events
- **Status Indicators**: Connection status display

## 🌍 Internationalization

### Supported Languages

- **English** (default)
- **French** (Français)
- **Dutch** (Nederlands)

### Translation Features

- **Automatic Detection**: Browser language detection
- **Manual Selection**: Language switcher
- **Persistent Choice**: Language preference saved
- **Lazy Loading**: Translations loaded on demand

### Adding Translations

1. Add translation files in `src/translations/`
2. Import in `src/lib/i18n.ts`
3. Use `useTranslation()` hook in components
4. Use `t('key')` function for translations

## 🔧 State Management

### Server State (TanStack Query)

- **API Data**: Cached server responses
- **Background Refetching**: Automatic data updates
- **Optimistic Updates**: Immediate UI updates
- **Error Handling**: Comprehensive error states

### Client State (Zustand)

- **Theme**: Dark/light mode preference
- **User Preferences**: UI settings
- **Temporary State**: Form data, UI state

### Form State (React Hook Form)

- **Form Validation**: Real-time validation
- **Error Handling**: Field-level error display
- **Performance**: Optimized re-renders

## 🎯 Performance Optimizations

### Code Splitting

- **Route-based**: Each page loads separately
- **Component-based**: Heavy components lazy-loaded
- **Bundle Analysis**: Vite bundle analyzer

### Caching

- **Query Caching**: TanStack Query cache
- **Asset Caching**: Vite static asset caching
- **API Response Caching**: Configurable cache times

### Loading States

- **Skeleton Screens**: Smooth loading experience
- **Progressive Loading**: Content loads incrementally
- **Error Boundaries**: Graceful error handling

## 🧪 Development

### Feature Development

Each feature follows a consistent structure:

```
features/feature-name/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks
├── services/         # API service layer
├── types/            # TypeScript types
└── index.ts          # Feature exports
```

### Component Development

Components follow these patterns:

- **Composition**: Build complex UIs from simple components
- **Props Interface**: Well-defined TypeScript interfaces
- **Accessibility**: ARIA attributes and keyboard navigation
- **Responsive**: Mobile-first responsive design

### API Integration

API services use a consistent pattern:

```typescript
export class FeatureService {
  static async getItems(): Promise<Item[]> {
    const response = await apiClient.get('/api/items');
    return ItemSchema.array().parse(response.data);
  }
}
```

### Error Handling

- **Error Boundaries**: React error boundary components
- **API Errors**: Centralized error handling
- **Toast Notifications**: User-friendly error messages
- **Fallback UI**: Graceful degradation

## 🚢 Production Build

### Build Process

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Optimization Features

- **Tree Shaking**: Removes unused code
- **Code Splitting**: Separate bundles for routes
- **Asset Optimization**: Minified CSS and JS
- **Image Optimization**: Compressed images

### Deployment Considerations

- **Environment Variables**: Configure for production
- **API Endpoints**: Set production API URLs
- **Error Reporting**: Configure error tracking
- **Analytics**: Set up user analytics

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com/)
- [i18next](https://www.i18next.com/)

```

```
