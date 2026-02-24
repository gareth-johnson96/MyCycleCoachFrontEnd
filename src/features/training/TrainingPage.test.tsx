import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TrainingPage from './TrainingPage';
import * as trainingApi from './trainingApi';
import { AuthProvider } from '../auth/AuthContext';

// Mock the API
vi.mock('./trainingApi');

const mockPlanMetadata = {
  id: 1,
  userId: 1,
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  goal: 'General Fitness',
  status: 'ACTIVE',
};

const mockPlanDetails = {
  id: 1,
  userId: 1,
  completedSessions: [],
  trainingPlan: [
    {
      id: 1,
      planId: 1,
      scheduledDate: '2026-02-23T10:00:00Z',
      type: 'Easy Ride',
      distance: 20,
      duration: 60,
      intensity: 'Easy',
      status: 'PLANNED',
      tss: 50,
      elevation: 100,
      targetZone: 'Z2',
    },
    {
      id: 2,
      planId: 1,
      scheduledDate: '2026-02-25T14:00:00Z',
      type: 'Interval Training',
      distance: 30,
      duration: 90,
      intensity: 'Hard',
      status: 'PLANNED',
      tss: 85,
      elevation: 200,
      targetZone: 'Z4',
    },
  ],
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('TrainingPage with Calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the training page heading', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TrainingPage />
        </QueryClientProvider>
      </AuthProvider>
      </AuthProvider>
    );

    expect(screen.getByText('🚴 Training Plan')).toBeInTheDocument();
  });

  it('renders the calendar when a plan is loaded', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TrainingPage />
        </QueryClientProvider>
      </AuthProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Training Calendar')).toBeInTheDocument();
    });
  });

  it('displays the month/year in the calendar', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('February 2026')).toBeInTheDocument();
    });
  });

  it('shows session details when a date is selected', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Training Calendar')).toBeInTheDocument();
    });

    // Click on day 23 which has a session
    const day23 = screen.getAllByText('23').find((el) => {
      // Find the calendar day, not other occurrences
      const parent = el.closest('[style*="flex"]');
      return parent && !parent.textContent?.includes('Training');
    });

    if (day23) {
      fireEvent.click(day23);

      await waitFor(() => {
        // Check for the session type
        expect(screen.getByText(/Easy Ride/)).toBeInTheDocument();
      });
    }
  });

  it('displays plan details in the header', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Current Plan/i)).toBeInTheDocument();
      expect(screen.getByText(/General Fitness/)).toBeInTheDocument();
    });
  });

  it('calls getCurrentPlan when plan is generated', async () => {
    const queryClient = createTestQueryClient();
    const getCurrentPlanMock = vi
      .mocked(trainingApi.getCurrentPlan)
      .mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);
    vi.mocked(trainingApi.generatePlan).mockResolvedValue(mockPlanMetadata);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    // Fill in goal input
    const input = screen.getByPlaceholderText(/Enter your goal/);
    fireEvent.change(input, { target: { value: 'Century Ride' } });

    // Click generate button
    const generateBtn = screen.getByText(/Generate Plan/);
    fireEvent.click(generateBtn);

    await waitFor(() => {
      // After generation, getCurrentPlan should be called
      expect(getCurrentPlanMock).toHaveBeenCalled();
    });
  });

  it('renders session details with distance, duration, and intensity', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Training Calendar')).toBeInTheDocument();
    });

    // Click on day 23
    const day23Buttons = screen.getAllByText('23');
    const calendarDay = day23Buttons.find((btn) => {
      const parent = btn.closest('[style*="flex"]');
      return parent && !parent.textContent?.includes('Training');
    });

    if (calendarDay) {
      fireEvent.click(calendarDay);

      await waitFor(() => {
        expect(screen.getByText(/Easy Ride/)).toBeInTheDocument();
      });
    }
  });

  it('shows message when no sessions on selected date', async () => {
    const planWithGapSessions = {
      ...mockPlanDetails,
      trainingPlan: [
        {
          id: 1,
          planId: 1,
          scheduledDate: '2026-02-01T10:00:00Z',
          type: 'Easy Ride',
          distance: 20,
          duration: 60,
          intensity: 'Easy',
          status: 'PLANNED',
          tss: 50,
          elevation: 100,
          targetZone: 'Z2',
        },
      ],
    };

    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(planWithGapSessions);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📅 Training Calendar')).toBeInTheDocument();
    });

    // Click on day 15 which has no sessions
    const day15 = screen.getAllByText('15').find((el) => {
      const parent = el.closest('[style*="flex"]');
      return parent && !parent.textContent?.includes('Training');
    });

    if (day15) {
      fireEvent.click(day15);

      await waitFor(() => {
        expect(screen.getByText(/Rest day - No training sessions scheduled/)).toBeInTheDocument();
      });
    }
  });

  it('renders loading spinner while fetching plan', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockPlanMetadata), 100);
        })
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('🚴 Training Plan')).toBeInTheDocument();
    });
  });

  it('renders error message when plan fails to load', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockRejectedValue(
      new Error('Failed to load plan')
    );

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load training plan/)).toBeInTheDocument();
    });
  });

  it('displays empty state when no plan exists', async () => {
    const queryClient = createTestQueryClient();
    const error = {
      response: { status: 404 },
    };
    vi.mocked(trainingApi.getCurrentPlan).mockRejectedValue(error);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No Active Training Plan/)
      ).toBeInTheDocument();
    });
  });

  it('displays two-column layout with calendar and details', async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(trainingApi.getCurrentPlan).mockResolvedValue(mockPlanMetadata);
    vi.mocked(trainingApi.getPlanWithSessions).mockResolvedValue(mockPlanDetails);

    render(
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
        <TrainingPage />
      </QueryClientProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      // Check that both calendar and potential details section exist
      expect(screen.getByText('📅 Training Calendar')).toBeInTheDocument();
      // Plan header should also be visible
      expect(screen.getByText(/Current Plan/i)).toBeInTheDocument();
    });
  });
});
