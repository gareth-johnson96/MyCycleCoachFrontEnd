import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPlan, generatePlan, updateSession } from './trainingApi';
import type { PlannedSession } from './types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Calendar from '../../components/Calendar';

export default function TrainingPage() {
  const queryClient = useQueryClient();
  const [goalInput, setGoalInput] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['trainingPlan'],
    queryFn: () => getCurrentPlan(dateRange?.from, dateRange?.to),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => generatePlan(goalInput.trim() || undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainingPlan'] });
      setGenerateError(null);
      // Set date range to the plan's dates
      setDateRange({ from: data.startDate, to: data.endDate });
    },
    onError: () => setGenerateError('Failed to generate plan.'),
  });

  const sessionMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: 'COMPLETED' | 'SKIPPED' }) =>
      updateSession(sessionId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingPlan'] });
    },
  });

  const selectedDateSessions = useMemo(() => {
    if (!plan?.sessions || !selectedDate) return [];
    return plan.sessions.filter((session) => {
      const sessionDate = session.scheduledDate.split('T')[0];
      return sessionDate === selectedDate;
    });
  }, [plan?.sessions, selectedDate]);

  const noActivePlan =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Training Plan</h1>

      {/* Generate Plan Section */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Generate New Plan</h2>
        <div style={styles.generateRow}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="text"
            placeholder="Goal (e.g. General Fitness, Century Ride)"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
          />
          <button
            style={styles.button}
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating…' : 'Generate Plan'}
          </button>
        </div>
        {generateError && <ErrorMessage message={generateError} />}
      </div>

      {/* Current Plan Section */}
      {isLoading && <LoadingSpinner />}

      {noActivePlan && (
        <div style={styles.emptyState}>
          No active training plan. Generate one above to get started.
        </div>
      )}

      {isError && !noActivePlan && <ErrorMessage message="Failed to load training plan." />}

      {plan && (
        <div>
          {/* Plan Header */}
          <div style={styles.card}>
            <div style={styles.planHeader}>
              <div>
                <h2 style={styles.cardTitle}>Current Plan</h2>
                <p style={styles.planMeta}>
                  <strong>Goal:</strong> {plan.goal}
                </p>
                <p style={styles.planMeta}>
                  <strong>Period:</strong> {plan.startDate} → {plan.endDate}
                </p>
                <p style={styles.planMeta}>
                  <strong>Status:</strong>{' '}
                  <span style={statusBadgeStyle(plan.status)}>{plan.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Calendar and Details Layout */}
          {plan.sessions && plan.sessions.length > 0 && (
            <div style={styles.calendarSection}>
              <div style={styles.calendarContainer}>
                <h3 style={styles.sectionTitle}>Training Calendar</h3>
                <Calendar
                  startDate={plan.startDate}
                  sessions={plan.sessions}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>

              {selectedDate && selectedDateSessions.length > 0 && (
                <div style={styles.detailsContainer}>
                  <h3 style={styles.sectionTitle}>
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <div style={styles.sessionList}>
                    {selectedDateSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onAction={(status) =>
                          sessionMutation.mutate({ sessionId: session.id, status })
                        }
                        isUpdating={sessionMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedDateSessions.length === 0 && (
                <div style={styles.detailsContainer}>
                  <h3 style={styles.sectionTitle}>
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h3>
                  <p style={{ color: '#6b7280' }}>No training sessions scheduled for this date.</p>
                </div>
              )}
            </div>
          )}

          {(!plan.sessions || plan.sessions.length === 0) && (
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>
              No sessions available for this plan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onAction,
  isUpdating,
}: {
  session: PlannedSession;
  onAction: (status: 'COMPLETED' | 'SKIPPED') => void;
  isUpdating: boolean;
}) {
  const isActionable = session.status === 'PLANNED';

  return (
    <div style={styles.sessionCard}>
      <div style={styles.sessionInfo}>
        <div style={styles.sessionDate}>{session.scheduledDate}</div>
        <div style={styles.sessionType}>{session.type}</div>
        <div style={styles.sessionDetails}>
          {session.distance != null && <span>{session.distance} km</span>}
          {session.duration != null && <span> · {session.duration} min</span>}
          {session.intensity && <span> · {session.intensity}</span>}
        </div>
      </div>
      <div style={styles.sessionRight}>
        <span style={statusBadgeStyle(session.status)}>{session.status}</span>
        {isActionable && (
          <div style={styles.sessionActions}>
            <button
              style={{ ...styles.actionBtn, ...styles.completeBtn }}
              onClick={() => onAction('COMPLETED')}
              disabled={isUpdating}
            >
              Complete
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.skipBtn }}
              onClick={() => onAction('SKIPPED')}
              disabled={isUpdating}
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: '#dbeafe', color: '#1d4ed8' },
    COMPLETED: { bg: '#d1fae5', color: '#065f46' },
    SKIPPED: { bg: '#f3f4f6', color: '#6b7280' },
    PLANNED: { bg: '#fef9c3', color: '#854d0e' },
  };
  const c = colors[status] ?? { bg: '#f3f4f6', color: '#374151' };
  return {
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: c.bg,
    color: c.color,
    whiteSpace: 'nowrap',
  };
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' },
  heading: { marginBottom: '1.5rem', color: '#111827' },
  card: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardTitle: { margin: '0 0 1rem', color: '#111827', fontSize: '1.1rem' },
  generateRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.55rem 1.25rem',
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    background: '#f9fafb',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  planHeader: { marginBottom: '1rem' },
  planMeta: { margin: '0.25rem 0', color: '#374151' },
  calendarSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  calendarContainer: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
  },
  detailsContainer: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
  },
  sectionTitle: { margin: '0 0 1.5rem', color: '#111827', fontSize: '1rem', fontWeight: 600 },
  sessionsTitle: { margin: '1rem 0 0.75rem', color: '#111827', fontSize: '1rem' },
  sessionList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  sessionCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  sessionInfo: { flex: 1 },
  sessionDate: { fontWeight: 600, color: '#111827', fontSize: '0.9rem' },
  sessionType: { color: '#374151', margin: '0.15rem 0' },
  sessionDetails: { color: '#6b7280', fontSize: '0.85rem' },
  sessionRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
    marginLeft: '1rem',
  },
  sessionActions: { display: 'flex', gap: '0.5rem' },
  actionBtn: {
    padding: '0.3rem 0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  completeBtn: { background: '#d1fae5', color: '#065f46' },
  skipBtn: { background: '#f3f4f6', color: '#374151' },
};
