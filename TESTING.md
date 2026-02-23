# Calendar Testing Guide

## Overview

The repository now has comprehensive test coverage across components, features, and API layers. The tests validate functionality, edge cases, and error handling for the critical parts of the application.

## Test Coverage Summary

**Overall Coverage: 71.76%**

- **Lines**: 71.76%
- **Functions**: 75.51%
- **Branches**: 89.9%
- **Statements**: 71.76%

### Coverage by Module

- **Components**: 100% coverage
  - Calendar.tsx
  - ErrorMessage.tsx
  - Layout.tsx
  - LoadingSpinner.tsx
  - ProtectedRoute.tsx

- **Auth Features**: 98.09% coverage
  - AuthContext.tsx
  - LoginPage.tsx
  - RegisterPage.tsx
  - authApi.ts

- **Training Features**: 98.09% coverage
  - TrainingPage.tsx
  - trainingApi.ts

- **Profile Features**: Mixed coverage
  - profileApi.ts: 100%
  - ProfilePage.tsx: Not tested (complex component, future work)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

All testing dependencies are already configured in `package.json`.

### 2. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns when files change)
npm test -- --watch

# Run tests with UI dashboard
npm test:ui

# Generate coverage report
npm test:coverage
```

## Test Files

### Component Tests

1. **[src/components/Calendar.test.tsx](src/components/Calendar.test.tsx)** (11 tests)
   - Calendar header rendering
   - Day of week display
   - Session highlighting
   - Date selection
   - Month navigation

2. **[src/components/Layout.test.tsx](src/components/Layout.test.tsx)** (6 tests)
   - Brand and navigation rendering
   - Logout functionality
   - Active link highlighting
   - Child route rendering

3. **[src/components/ProtectedRoute.test.tsx](src/components/ProtectedRoute.test.tsx)** (2 tests)
   - Authenticated access
   - Redirect to login

### Auth Feature Tests

4. **[src/features/auth/AuthContext.test.tsx](src/features/auth/AuthContext.test.tsx)** (6 tests)
   - Context initialization
   - Login/logout functionality
   - Token management
   - Authentication state

5. **[src/features/auth/LoginPage.test.tsx](src/features/auth/LoginPage.test.tsx)** (8 tests)
   - Form rendering
   - Field validation
   - Successful login
   - Error handling
   - Loading states

6. **[src/features/auth/RegisterPage.test.tsx](src/features/auth/RegisterPage.test.tsx)** (10 tests)
   - Form rendering
   - Field validation
   - Password strength validation
   - Successful registration
   - Server error handling

7. **[src/features/auth/authApi.test.ts](src/features/auth/authApi.test.ts)** (2 tests)
   - Login API calls
   - Register API calls

### Training Feature Tests

8. **[src/features/training/TrainingPage.test.tsx](src/features/training/TrainingPage.test.tsx)** (12 tests)
   - Calendar integration
   - Plan header display
   - Session details
   - Loading and error states
   - Empty states

9. **[src/features/training/trainingApi.test.ts](src/features/training/trainingApi.test.ts)** (5 tests)
   - Get current plan
   - Generate plan
   - Update session

### Profile Feature Tests

10. **[src/features/profile/profileApi.test.ts](src/features/profile/profileApi.test.ts)** (4 tests)
    - Get profile
    - Update profile
    - Save background
    - Update goals

### Utility Tests

11. **[src/test/calendarUtils.test.ts](src/test/calendarUtils.test.ts)** (6 tests)
    - Calendar utility functions

## Coverage Thresholds

The project has configured coverage thresholds in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 60,
    functions: 50,
    branches: 80,
    statements: 60,
  },
}
```

All thresholds are currently met ✅

## Running Specific Tests

```bash
# Run only Calendar tests
npm test Calendar

# Run only auth-related tests
npm test auth

# Run a specific test file
npm test LoginPage

# Run tests matching a pattern
npm test -- --grep "validation"
```

## Continuous Integration (CI)

To add tests to your CI/CD pipeline, add this to your workflow:

```yaml
- name: Run tests
  run: npm test -- --run

- name: Run tests with coverage
  run: npm test:coverage
```

The `--run` flag runs tests once and exits (useful for CI environments).

## What the Tests Validate

### Authentication Flow ✓
- User registration with validation
- User login with error handling
- Token management and storage
- Protected route access control
- Logout functionality

### Training Features ✓
- Calendar rendering and navigation
- Session display and highlighting
- Date selection
- Training plan display
- API integration

### Form Validation ✓
- Required fields
- Email format validation
- Password strength requirements
- Server error display
- Loading states

### Component Integration ✓
- Navigation and routing
- State management
- Error boundaries
- Loading states

## Troubleshooting

### "Module not found" errors

Make sure all dependencies are installed:
```bash
npm install
```

### Tests timeout

If tests are timing out, increase the timeout in vitest.config.ts:
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

### Coverage files in git

The `coverage/` directory is excluded via `.gitignore` to prevent committing generated reports.

## Adding More Tests

To add tests for new features:

1. Create a `.test.tsx` or `.test.ts` file next to your component/module
2. Follow the existing test patterns
3. Use descriptive test names that explain what is being tested
4. Run `npm test -- --watch` during development

Example test structure:

```typescript
describe('MyComponent', () => {
  it('renders with correct props', () => {
    // Arrange
    const props = { /* ... */ };
    
    // Act
    render(<MyComponent {...props} />);
    
    // Assert
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testing-library.com/docs/queries/about)

## Future Improvements

Areas that could benefit from additional test coverage:

1. **ProfilePage.tsx** - Complex component with multiple tabs and forms
2. **App.tsx** - Integration tests for the main app component
3. **apiClient.ts** - Token refresh flow and error handling
4. **E2E tests** - Full user flows using Playwright or Cypress

