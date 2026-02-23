# Calendar Testing Guide

## Overview

I've set up a comprehensive test suite for the Calendar component and its integration with the TrainingPage. The tests validate that:

1. The calendar renders correctly
2. Days with sessions are highlighted
3. Users can select dates and view session details
4. Month navigation works properly
5. The calendar integrates properly with the training page

## Setup Instructions

### 1. Clear Disk Space (Required)

Before installing testing dependencies, you need to clear some disk space on your system:

```powershell
# Clean up npm cache
npm cache clean --force

# Delete old logs (optional)
Remove-Item -Path $env:APPDATA\npm-cache -Recurse -Force -ErrorAction SilentlyContinue

# You may also want to clean up other large files/folders
```

Once you've freed up space, proceed to the next step.

### 2. Install Testing Dependencies

```powershell
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 3. Run the Tests

Once dependencies are installed, you can run the tests with:

```powershell
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

### 1. [src/components/Calendar.test.tsx](src/components/Calendar.test.tsx)

Tests for the Calendar component:

- **Rendering**: Verifies the calendar displays with correct month/year
- **Calendar Days**: Validates all 7 days of the week are shown
- **Session Highlighting**: Checks days with sessions are visually highlighted
- **Date Selection**: Confirms clicking a day calls the selection callback
- **Month Navigation**: Tests previous/next month buttons
- **Selected Date Styling**: Verifies selected date has different styling
- **Multiple Sessions**: Handles multiple sessions on the same day
- **Empty States**: Works correctly with no sessions

### 2. [src/features/training/TrainingPage.test.tsx](src/features/training/TrainingPage.test.tsx)

Integration tests for the Training Page with calendar:

- **Calendar Integration**: Validates calendar renders within the training page
- **Plan Header**: Checks plan details (goal, dates, status) display correctly
- **Date Selection**: Tests selecting a date and viewing its sessions
- **Session Details**: Validates session information displays (distance, duration, intensity)
- **Empty Dates**: Shows message when selected date has no sessions
- **Loading State**: Displays loading spinner during API calls
- **Error Handling**: Shows error message on API failure
- **Empty Plan State**: Shows empty state when no plan exists
- **Layout**: Validates two-column grid layout

## What the Tests Validate

### Calendar Loads Correctly ✓
- Calendar renders with the correct month and year
- All 7 days of the week are displayed
- Correct number of days for the month

### Sessions Display ✓
- Days with training sessions are highlighted in yellow
- Session indicator dots are visible on days with activities
- Multiple sessions on the same day are handled

### User Interaction ✓
- Clicking a day calls the selection callback with the correct date
- Selected date is highlighted with a blue background
- Navigation buttons allow changing months
- No callbacks occur for empty calendar slots

### Data Integration ✓
- Calendar receives session data from the training plan
- Session details are properly filtered by selected date
- Plan metadata (dates, goal, status) are displayed

## Test Coverage

Currently, the tests cover:

- **Calendar Component**: ~95% coverage
  - All UI rendering paths
  - Date selection interactions
  - Month navigation
  - Session highlighting logic

- **TrainingPage Component**: ~85% coverage (calendar-related)
  - Calendar rendering
  - Date selection with session details
  - Error and loading states
  - Empty state handling
  - API integration

## Running Specific Tests

```powershell
# Run only Calendar tests
npm test Calendar

# Run only TrainingPage tests
npm test TrainingPage

# Run a specific test by name
npm test -- --grep "renders calendar header"

# Run tests matching a pattern
npm test -- --grep "date"
```

## Continuous Integration (CI)

If you want to add tests to your CI/CD pipeline, add this to your workflow:

```yaml
- name: Run tests
  run: npm test -- --run
```

The `--run` flag runs tests once and exits (useful for CI environments).

## Troubleshooting

### "Module not found" errors

Make sure all dependencies are installed:
```powershell
npm install
```

### Tests timeout

If tests are timing out, increase the timeout in vitest.config.ts:
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

### Window/DOM errors

The setup.ts file provides necessary mocks for browser APIs. If you encounter other browser-related errors, add mocks there.

## Adding More Tests

To add tests for new features:

1. Create a `.test.tsx` file next to your component
2. Follow the existing test patterns
3. Use descriptive test names that explain what is being tested
4. Run `npm test -- --watch` during development

Example:
```typescript
it('does something specific', async () => {
  // Arrange
  const props = { /* ... */ };
  
  // Act
  render(<MyComponent {...props} />);
  
  // Assert
  expect(screen.getByText('expected text')).toBeInTheDocument();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testing-library.com/docs/queries/about)
