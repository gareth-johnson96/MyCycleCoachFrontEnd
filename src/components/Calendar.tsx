import { useState } from 'react';
import type { PlannedSession } from '../features/training/types';

interface CalendarProps {
  startDate: string;
  sessions: PlannedSession[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

export default function Calendar({
  startDate,
  sessions,
  onDateSelect,
  selectedDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(startDate));

  const sessionsByDate = sessions.reduce(
    (acc, session) => {
      const date = session.scheduledDate.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    },
    {} as Record<string, PlannedSession[]>
  );

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatDateForComparison = (day: number | null) => {
    if (day === null) return null;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handlePrevMonth} style={styles.navButton}>
          ←
        </button>
        <h3 style={styles.monthYear}>{monthYear}</h3>
        <button onClick={handleNextMonth} style={styles.navButton}>
          →
        </button>
      </div>

      <div style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div style={styles.days}>
        {days.map((day, index) => {
          const dateStr = formatDateForComparison(day);
          const hasSessions = dateStr && sessionsByDate[dateStr];
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={index}
              onClick={() => dateStr && onDateSelect(dateStr)}
              style={{
                ...styles.day,
                ...(day === null && styles.emptyDay),
                ...(hasSessions && styles.dayWithSession),
                ...(isSelected && styles.selectedDay),
                cursor: day === null ? 'default' : 'pointer',
              }}
            >
              {day && (
                <>
                  <div style={styles.dayNumber}>{day}</div>
                  {hasSessions && <div style={styles.sessionDot} />}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  monthYear: {
    margin: 0,
    color: '#111827',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  navButton: {
    background: 'transparent',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '4px',
    padding: '0.4rem 0.8rem',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#374151',
  },
  weekDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.25rem',
    marginBottom: '0.5rem',
  },
  weekDay: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: '#6b7280',
    padding: '0.5rem 0',
  },
  days: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.25rem',
  },
  day: {
    aspectRatio: '1',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    background: '#fff',
    transition: 'all 0.2s ease',
  },
  emptyDay: {
    background: '#f9fafb',
    borderColor: 'transparent',
    cursor: 'default',
  },
  dayNumber: {
    fontSize: '0.9rem',
    color: '#111827',
    fontWeight: 500,
  },
  dayWithSession: {
    background: '#fef9c3',
    borderColor: '#fcd34d',
  },
  selectedDay: {
    background: '#1a56db',
    borderColor: '#1a56db',
  },
  sessionDot: {
    width: '4px',
    height: '4px',
    background: '#854d0e',
    borderRadius: '50%',
    marginTop: '2px',
  },
};
