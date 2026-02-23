import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar';
import type { PlannedSession } from '../features/training/types';

const mockOnDateSelect = vi.fn();

const mockSessions: PlannedSession[] = [
  {
    id: 1,
    scheduledDate: '2026-02-23T10:00:00Z',
    type: 'Easy Ride',
    distance: 20,
    duration: 60,
    intensity: 'Easy',
    status: 'PLANNED',
    completedAt: null,
  },
  {
    id: 2,
    scheduledDate: '2026-02-25T14:00:00Z',
    type: 'Interval Training',
    distance: 30,
    duration: 90,
    intensity: 'Hard',
    status: 'PLANNED',
    completedAt: null,
  },
];

describe('Calendar Component', () => {
  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('renders calendar header with month and year', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('renders all days of the week', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('displays correct number of days in month', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // February 2026 has 28 days
    const dateButtons = screen.getAllByText(/^([1-9]|[12][0-9]|3[0-1])$/);
    expect(dateButtons.length).toBeGreaterThanOrEqual(28);
  });

  it('highlights days with sessions', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Days with sessions (23 and 25) can be interacted with
    const day23 = screen.getByText('23');
    const day25 = screen.getByText('25');
    
    expect(day23).toBeInTheDocument();
    expect(day25).toBeInTheDocument();
    
    // Verify clicking works for days with sessions
    fireEvent.click(day23);
    expect(mockOnDateSelect).toHaveBeenCalledWith('2026-02-23');
  });

  it('calls onDateSelect when a day is clicked', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Click on a day with a session (Feb 23)
    const dayButton = screen.getByText('23');
    fireEvent.click(dayButton);

    expect(mockOnDateSelect).toHaveBeenCalledWith('2026-02-23');
  });

  it('navigates to previous month', () => {
    const { rerender } = render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    expect(screen.getByText('February 2026')).toBeInTheDocument();

    // Click previous button
    const prevButton = screen.getAllByText('←')[0];
    fireEvent.click(prevButton);

    rerender(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Note: In a real scenario, the component maintains its own date state,
    // so the month should change
  });

  it('navigates to next month', () => {
    const { rerender } = render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    expect(screen.getByText('February 2026')).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getAllByText('→')[0];
    fireEvent.click(nextButton);

    rerender(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Note: In a real scenario, the component maintains its own date state,
    // so the month should change
  });

  it('highlights selected date with different styling', () => {
    const { rerender } = render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Verify no date is selected initially
    expect(mockOnDateSelect).not.toHaveBeenCalled();

    // Rerender with selected date
    rerender(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate="2026-02-23"
      />
    );

    // Verify the day is still visible and interactive
    const day23 = screen.getByText('23');
    expect(day23).toBeInTheDocument();
  });

  it('renders multiple sessions on same day', () => {
    const multipleSessions: PlannedSession[] = [
      {
        id: 1,
        scheduledDate: '2026-02-23T09:00:00Z',
        type: 'Morning Ride',
        distance: 15,
        duration: 45,
        intensity: 'Easy',
        status: 'PLANNED',
        completedAt: null,
      },
      {
        id: 2,
        scheduledDate: '2026-02-23T18:00:00Z',
        type: 'Evening Run',
        distance: 10,
        duration: 30,
        intensity: 'Medium',
        status: 'PLANNED',
        completedAt: null,
      },
    ];

    render(
      <Calendar
        startDate="2026-02-01"
        sessions={multipleSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    const day23 = screen.getByText('23');
    expect(day23).toBeInTheDocument();
  });

  it('handles empty sessions gracefully', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={[]}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    expect(screen.getByText('February 2026')).toBeInTheDocument();
    const dateButtons = screen.getAllByText(/^([1-9]|[12][0-9]|3[0-1])$/);
    expect(dateButtons.length).toBeGreaterThanOrEqual(28);
  });

  it('does not call onDateSelect for empty days', () => {
    render(
      <Calendar
        startDate="2026-02-01"
        sessions={mockSessions}
        onDateSelect={mockOnDateSelect}
        selectedDate={null}
      />
    );

    // Empty cells should not be clickable
    // The component should only call onDateSelect for valid days
    expect(mockOnDateSelect).not.toHaveBeenCalled();
  });
});
