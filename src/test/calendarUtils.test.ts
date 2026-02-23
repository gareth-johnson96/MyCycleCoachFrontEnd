import { describe, it, expect } from 'vitest';

/**
 * Utility function tests for calendar date handling
 */

describe('Calendar Date Utilities', () => {
  /**
   * getDaysInMonth - Returns the number of days in a given month
   */
  it('calculates correct number of days in each month', () => {
    const getDaysInMonth = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    // Test various months
    expect(getDaysInMonth(new Date(2026, 0))).toBe(31); // January
    expect(getDaysInMonth(new Date(2026, 1))).toBe(28); // February (non-leap)
    expect(getDaysInMonth(new Date(2026, 3))).toBe(30); // April
    expect(getDaysInMonth(new Date(2026, 11))).toBe(31); // December
  });

  /**
   * getFirstDayOfMonth - Returns which day of week the month starts on
   */
  it('calculates correct first day of month', () => {
    const getFirstDayOfMonth = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    // February 2026 starts on Sunday (0)
    expect(getFirstDayOfMonth(new Date(2026, 1))).toBe(0);
  });

  /**
   * formatDateForComparison - Converts date to YYYY-MM-DD format
   */
  it('formats date strings correctly for comparison', () => {
    const formatDateForComparison = (date: Date) =>
      date.toISOString().split('T')[0];

    const date = new Date(2026, 1, 23);
    const formatted = formatDateForComparison(date);

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatted).toEqual('2026-02-23');
  });

  /**
   * sessionsByDate - Groups sessions by their scheduled date
   */
  it('groups sessions by date correctly', () => {
    const sessions = [
      {
        scheduledDate: '2026-02-23T10:00:00Z',
        type: 'Ride',
      },
      {
        scheduledDate: '2026-02-23T18:00:00Z',
        type: 'Run',
      },
      {
        scheduledDate: '2026-02-25T14:00:00Z',
        type: 'Ride',
      },
    ];

    const sessionsByDate = sessions.reduce(
      (acc, session) => {
        const date = session.scheduledDate.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
      },
      {} as Record<string, typeof sessions>
    );

    expect(sessionsByDate['2026-02-23']).toHaveLength(2);
    expect(sessionsByDate['2026-02-25']).toHaveLength(1);
    expect(sessionsByDate['2026-02-24']).toBeUndefined();
  });

  /**
   * isDateInRange - Checks if a date falls within a date range
   */
  it('validates if date is within range', () => {
    const isDateInRange = (date: Date, start: Date, end: Date) =>
      date >= start && date <= end;

    const startDate = new Date(2026, 1, 1);
    const endDate = new Date(2026, 1, 28);
    const testDate = new Date(2026, 1, 15);
    const outsideDate = new Date(2026, 2, 1);

    expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
    expect(isDateInRange(outsideDate, startDate, endDate)).toBe(false);
  });

  /**
   * getCalendarDays - Generates array of days for calendar grid
   */
  it('generates correct calendar day array', () => {
    const getDaysInMonth = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const getCalendarDays = (date: Date) => {
      const daysInMonth = getDaysInMonth(date);
      const firstDay = getFirstDayOfMonth(date);
      const days: (number | null)[] = [];

      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }

      return days;
    };

    const februaryDays = getCalendarDays(new Date(2026, 1));

    // February 2026 starts on Sunday, so first day should have no leading nulls
    expect(februaryDays[0]).toBe(1);

    // Should have 28 days of February
    expect(februaryDays.filter((d) => d !== null)).toHaveLength(28);

    // Last element should be 28 (last day of Feb)
    const lastDay = februaryDays.filter((d) => d !== null).pop();
    expect(lastDay).toBe(28);
  });
});
