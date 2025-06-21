# E2E Testing

End-to-end testing suite for Competition Manager using Playwright. This package provides comprehensive testing coverage for the entire application flow.

## 🏗️ Architecture

### Tech Stack

- **Testing Framework**: Playwright
- **Language**: TypeScript
- **Browsers**: Chromium, Firefox, WebKit
- **Reporting**: HTML reports with screenshots and videos

### Project Structure

```
tests/
├── auth.spec.ts          # Authentication flow tests
├── health-check.spec.ts  # Basic health check tests
├── pages/                # Page Object Model classes
│   ├── auth.page.ts      # Authentication page objects
│   ├── competition.page.ts # Competition management pages
│   └── organization.page.ts # Organization pages
├── utils/                # Test utilities and helpers
│   ├── test-data.ts      # Test data factories
│   ├── api-helpers.ts    # API testing utilities
│   └── db-helpers.ts     # Database setup/cleanup
├── fixtures/             # Test fixtures and mock data
└── reports/              # Generated test reports
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Backend and Frontend services running
- Test database available

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with browser UI
npm run test:headed

# Run tests with Playwright UI
npm run test:ui

# Run specific test file
npm run test auth.spec.ts

# Debug tests
npm run test:debug

# Generate test report
npm run test:report
```

## 🧪 Test Structure

### Test Categories

#### Health Check Tests

Basic connectivity and service availability tests:

```typescript
// health-check.spec.ts
test('API health check', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
});

test('Frontend loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Competition Manager/);
});
```

#### Authentication Tests

User registration, login, and session management:

```typescript
// auth.spec.ts
test('user can sign up', async ({ page }) => {
  await page.goto('/sign-up');
  await page.fill('[data-testid=email-input]', 'test@example.com');
  await page.fill('[data-testid=password-input]', 'password123');
  await page.click('[data-testid=submit-button]');

  await expect(page).toHaveURL('/dashboard');
});

test('user can sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('[data-testid=email-input]', 'test@example.com');
  await page.fill('[data-testid=password-input]', 'password123');
  await page.click('[data-testid=submit-button]');

  await expect(page).toHaveURL('/dashboard');
});
```

#### Competition Management Tests

End-to-end competition creation and management:

```typescript
test('create competition flow', async ({ page }) => {
  // Login first
  await loginAsUser(page, 'admin@example.com');

  // Navigate to competitions
  await page.goto('/competitions');

  // Create new competition
  await page.click('[data-testid=create-competition]');
  await page.fill('[data-testid=competition-name]', 'Test Competition');
  await page.fill('[data-testid=competition-location]', 'Test Location');
  await page.click('[data-testid=submit-competition]');

  // Verify creation
  await expect(page.locator('[data-testid=competition-list]')).toContainText(
    'Test Competition'
  );
});
```

## 📄 Page Object Model

### Page Classes

#### Authentication Page

```typescript
// pages/auth.page.ts
export class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/sign-in');
  }

  async signIn(email: string, password: string) {
    await this.page.fill('[data-testid=email-input]', email);
    await this.page.fill('[data-testid=password-input]', password);
    await this.page.click('[data-testid=submit-button]');
  }

  async signUp(email: string, password: string, name: string) {
    await this.page.goto('/sign-up');
    await this.page.fill('[data-testid=name-input]', name);
    await this.page.fill('[data-testid=email-input]', email);
    await this.page.fill('[data-testid=password-input]', password);
    await this.page.click('[data-testid=submit-button]');
  }

  async expectSignedIn() {
    await expect(this.page).toHaveURL('/dashboard');
  }
}
```

#### Competition Page

```typescript
// pages/competition.page.ts
export class CompetitionPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/competitions');
  }

  async createCompetition(data: CompetitionData) {
    await this.page.click('[data-testid=create-competition]');
    await this.page.fill('[data-testid=competition-name]', data.name);
    await this.page.fill('[data-testid=competition-location]', data.location);
    await this.page.selectOption(
      '[data-testid=competition-category]',
      data.category
    );
    await this.page.click('[data-testid=submit-competition]');
  }

  async expectCompetitionExists(name: string) {
    await expect(
      this.page.locator('[data-testid=competition-list]')
    ).toContainText(name);
  }
}
```

## 🔧 Test Utilities

### Test Data Factories

```typescript
// utils/test-data.ts
export const createTestUser = (overrides: Partial<User> = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User',
  ...overrides,
});

export const createTestCompetition = (
  overrides: Partial<Competition> = {}
) => ({
  name: `Test Competition ${Date.now()}`,
  location: 'Test Location',
  startDate: new Date(),
  description: 'Test competition description',
  ...overrides,
});

export const createTestOrganization = (
  overrides: Partial<Organization> = {}
) => ({
  name: `Test Organization ${Date.now()}`,
  slug: `test-org-${Date.now()}`,
  ...overrides,
});
```

### API Helpers

```typescript
// utils/api-helpers.ts
export class ApiHelpers {
  constructor(private request: APIRequestContext) {}

  async createUser(userData: Partial<User>) {
    return await this.request.post('/api/auth/sign-up', {
      data: userData,
    });
  }

  async createCompetition(competitionData: Partial<Competition>) {
    return await this.request.post('/api/competitions', {
      data: competitionData,
    });
  }

  async deleteCompetition(id: string) {
    return await this.request.delete(`/api/competitions/${id}`);
  }
}
```

### Database Setup

```typescript
// utils/db-helpers.ts
export class DatabaseHelpers {
  static async cleanupTestData() {
    // Clean up test data after tests
    await prisma.competition.deleteMany({
      where: { name: { startsWith: 'Test Competition' } },
    });

    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });
  }

  static async seedTestData() {
    // Create necessary test data
    const testOrg = await prisma.organization.create({
      data: createTestOrganization(),
    });

    const testUser = await prisma.user.create({
      data: createTestUser(),
    });

    return { testOrg, testUser };
  }
}
```

## ⚙️ Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Test Environment Setup

```typescript
// setup.ts
import { test as setup } from '@playwright/test';
import { DatabaseHelpers } from './utils/db-helpers';

setup('setup test environment', async () => {
  // Clean up previous test data
  await DatabaseHelpers.cleanupTestData();

  // Seed required test data
  await DatabaseHelpers.seedTestData();
});
```

## 📊 Test Reporting

### HTML Reports

Playwright generates comprehensive HTML reports with:

- Test results overview
- Failed test details
- Screenshots and videos
- Trace files for debugging

### CI/CD Integration

The tests are integrated with GitHub Actions:

```yaml
# .github/workflows/e2e-tests.yml
- name: Run E2E Tests
  run: npm run test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔄 Test Scenarios

### Critical User Journeys

1. **User Registration & Authentication**

   - Sign up with valid email
   - Email verification (if enabled)
   - Sign in with credentials
   - Password reset flow

2. **Organization Management**

   - Create organization
   - Invite members
   - Role management
   - Organization settings

3. **Competition Management**

   - Create competition
   - Configure events and categories
   - Manage registrations
   - Publish competition

4. **Real-time Features**
   - Live updates during competitions
   - Notifications
   - Socket connections

### Edge Cases & Error Handling

- Network failures
- Invalid form submissions
- Permission denied scenarios
- Data validation errors
- Concurrent user actions

## 🚀 Running in CI/CD

### GitHub Actions Integration

```bash
# Start services
npm run services:start

# Wait for services to be ready
npm run wait-for-services

# Run tests
npm run test

# Generate reports
npm run test:report

# Cleanup
npm run services:stop
```

### Docker Integration

```dockerfile
# Dockerfile for E2E testing
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx playwright install

CMD ["npm", "run", "test"]
```

## 🛠️ Development Tips

### Writing Good Tests

1. **Use Page Object Model** for maintainable tests
2. **Isolate tests** - each test should be independent
3. **Use meaningful test data** - avoid hardcoded values
4. **Add proper assertions** - verify expected outcomes
5. **Handle async operations** properly

### Debugging Tests

```bash
# Run in headed mode
npm run test:headed

# Run with debugger
npm run test:debug

# Run specific test
npm run test -- --grep "specific test name"

# Generate code for interactions
npm run test:codegen
```

### Best Practices

- **Test user journeys**, not just individual features
- **Use data-testid attributes** for reliable selectors
- **Mock external services** when appropriate
- **Keep tests fast** - avoid unnecessary waits
- **Maintain test data** - clean up after tests
- **Use parallel execution** for faster feedback

## 📝 Maintenance

### Regular Tasks

1. **Update test data** as application evolves
2. **Review and update selectors** when UI changes
3. **Add tests for new features**
4. **Remove tests for deprecated features**
5. **Monitor test performance** and optimize slow tests

### Troubleshooting

Common issues and solutions:

- **Flaky tests**: Add proper waits and improve selectors
- **Slow tests**: Optimize database setup and API calls
- **CI failures**: Check service dependencies and timing
- **Cross-browser issues**: Test on different browsers locally
