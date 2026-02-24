import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GpxUploader from './GpxUploader';
import * as trainingApi from './trainingApi';

vi.mock('./trainingApi');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe('GpxUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the GPX uploader component', () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <GpxUploader userId={1} />
      </QueryClientProvider>
    );

    expect(screen.getByText('📊 GPX Route Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Upload a GPX file/)).toBeInTheDocument();
  });

  it('displays file name when a file is selected', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <GpxUploader userId={1} />
      </QueryClientProvider>
    );

    const file = new File(['gpx content'], 'test-route.gpx', { type: 'application/gpx+xml' });
    const container = screen.getByText(/Choose GPX File/).closest('label');
    const input = container?.querySelector('input[type="file"]') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText('📁 test-route.gpx')).toBeInTheDocument();
    });
  });

  it('shows upload button after file selection', async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <GpxUploader userId={1} />
      </QueryClientProvider>
    );

    const file = new File(['gpx content'], 'test-route.gpx', { type: 'application/gpx+xml' });
    const container = screen.getByText(/Choose GPX File/).closest('label');
    const input = container?.querySelector('input[type="file"]') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    await waitFor(() => {
      expect(screen.getByText('🚀 Upload & Analyze')).toBeInTheDocument();
    });
  });

  it('displays analysis results after successful upload', async () => {
    const queryClient = createTestQueryClient();
    const mockAnalysis = {
      gpxFileId: 1,
      filename: 'test-route.gpx',
      climbCount: 2,
      climbs: [
        {
          id: 1,
          distanceMeters: 1000,
          elevationGainMeters: 100,
          averageGradient: 0.1,
          startPointIndex: 0,
          endPointIndex: 50,
        },
      ],
      totalDistanceKm: 25.5,
      estimatedRideTimeMinutes: 75,
      uploadedAt: '2026-02-23T10:00:00Z',
    };

    vi.mocked(trainingApi.uploadGpxFile).mockResolvedValue(mockAnalysis);

    render(
      <QueryClientProvider client={queryClient}>
        <GpxUploader userId={1} />
      </QueryClientProvider>
    );

    const file = new File(['gpx content'], 'test-route.gpx', { type: 'application/gpx+xml' });
    const container = screen.getByText(/Choose GPX File/).closest('label');
    const input = container?.querySelector('input[type="file"]') as HTMLInputElement;

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
      });
      fireEvent.change(input);
    }

    const uploadButton = await screen.findByText('🚀 Upload & Analyze');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/25.5 km/)).toBeInTheDocument();
      expect(screen.getByText(/1h 15m/)).toBeInTheDocument();
      expect(screen.getByText(/Climbs Detected/)).toBeInTheDocument();
    });
  });
});
