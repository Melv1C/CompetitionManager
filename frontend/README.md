# Frontend

The frontend application for Competition Manager - a modern React SPA built with Vite, TanStack Query, and shadcn/ui.

## 🏗️ Architecture

### Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Styling**: Tailwind CSS v4
- **Internationalization**: i18next (EN/FR/NL)
- **Authentication**: Better Auth
- **Validation**: Zod schemas from `@repo/core`

### Project Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx              # Main app component and routing
├── index.css            # Global styles and Tailwind imports
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components (auto-generated)
│   └── layout/          # Layout components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   ├── organization/    # Organization management
│   ├── competition/     # Competition features
│   └── theme/           # Theme management
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api.ts           # API client configuration
│   ├── i18n.ts          # Internationalization setup
│   └── utils.ts         # Utility functions
├── store/               # Zustand stores
└── translations/        # i18n translation files
    ├── en.json
    ├── fr.json
    └── nl.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

The application will be available at `http://localhost:5173`

## 🎨 UI Components

### shadcn/ui Integration

This project uses shadcn/ui for consistent, accessible UI components:

```bash
# Add new shadcn/ui components
npx shadcn@latest add [component-name]

# List available components
npx shadcn@latest add
```

**Available Components:**

- `Avatar`, `Button`, `Card`, `Dialog`, `Form`
- `Input`, `Label`, `Select`, `Switch`, `Tabs`
- `Tooltip`, `Popover`, `Dropdown Menu`
- And many more...

### Component Guidelines

- Use functional components only
- Keep components under 300 lines
- Extract custom hooks for complex logic
- Use TypeScript strict mode
- Implement proper error boundaries

## 🔄 State Management

### TanStack Query (React Query)

Used for server state management:

```typescript
// Example query hook
const { data, isLoading, error } = useQuery({
  queryKey: ['competitions'],
  queryFn: () => api.competitions.list(),
});

// Example mutation hook
const createCompetition = useMutation({
  mutationFn: api.competitions.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
  },
});
```

### Zustand

Used for client-side global state:

```typescript
// Example store
const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
```

## 🌍 Internationalization

### i18next Configuration

The app supports three languages: English, French, and Dutch.

```typescript
// Usage in components
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('common.welcome')}</h1>;
}
```

### Translation Files

```json
// translations/en.json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel"
  },
  "competition": {
    "title": "Competition",
    "create": "Create Competition"
  }
}
```

### Adding New Translations

1. Add keys to all translation files (`en.json`, `fr.json`, `nl.json`)
2. Use the `t()` function in components
3. Follow the nested key structure for organization

## 🔐 Authentication

### Better Auth Integration

```typescript
// Authentication hook
const { user, isAuthenticated, signIn, signOut } = useAuth();

// Protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }
  return <>{children}</>;
}
```

### Route Protection

The app implements route-based authentication:

- **Public Routes**: Home, Sign In, Sign Up
- **Authenticated Routes**: Dashboard, Profile, Settings
- **Organization Routes**: Competition management (requires org membership)
- **Admin Routes**: System administration (requires admin role)

## 🎨 Styling

### Tailwind CSS v4

```css
/* Global styles in index.css */
@import 'tailwindcss';

/* Custom utility classes */
.scroll-area {
  @apply overflow-auto scrollbar-thin scrollbar-track-transparent;
}
```

### Component Styling

```tsx
// Example component with Tailwind classes
function CompetitionCard({ competition }: { competition: Competition }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{competition.name}</h3>
      <p className="text-sm text-muted-foreground">{competition.description}</p>
    </div>
  );
}
```

### Theme Support

The app supports light and dark themes:

```typescript
// Theme toggle
const { theme, setTheme } = useTheme();

function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </Button>
  );
}
```

## 📱 Features

### Competition Management

- Create and edit competitions
- Configure events and categories
- Manage participant registrations
- View competition schedules

### Organization Management

- Organization dashboard
- Member management
- Role-based permissions
- Invitation system

### Real-time Updates

- Live competition updates
- Real-time notifications
- Socket.IO integration

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions

## 🔌 API Integration

### API Client

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  // Add auth headers if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);
```

### Data Validation

All API responses are validated using Zod schemas:

```typescript
// Example API call with validation
const fetchCompetitions = async (): Promise<Competition[]> => {
  const response = await api.get('/api/competitions');
  return competitionListSchema.parse(response.data);
};
```

## 🧪 Testing

### Component Testing

```bash
# Run component tests (if configured)
npm run test

# Run tests in watch mode
npm run test:watch
```

### E2E Testing

End-to-end tests are located in the `../e2e` directory and test the full application flow.

## 📦 Build & Deployment

### Production Build

```bash
# Create production build
npm run build

# The build output will be in the `dist/` directory
```

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Docker Deployment

```bash
# Build Docker image
docker build -t competition-manager-frontend .

# Run with Docker Compose
docker-compose up frontend
```

## 🛠️ Development Tips

### Code Organization

- Group related components in feature folders
- Use barrel exports (`index.ts`) for clean imports
- Keep components focused on a single responsibility
- Extract custom hooks for reusable logic

### Performance Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Use TanStack Query for caching
- Lazy load heavy components and pages

### Best Practices

- Always handle loading and error states
- Use TypeScript strict mode
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG)
- Use semantic HTML elements

### Common Patterns

```typescript
// Loading state pattern
function CompetitionList() {
  const { data: competitions, isLoading, error } = useCompetitions();

  if (isLoading) return <CompetitionListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!competitions?.length) return <EmptyState />;

  return (
    <div>
      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}
    </div>
  );
}
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` file includes:

- Path aliases for clean imports
- Plugin configuration
- Build optimization
- Development server settings

### TypeScript Configuration

Strict TypeScript configuration with:

- `strict: true`
- Path mapping for `@/` alias
- React JSX support
- Modern ES target
