import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPlan, getPlanWithSessions, generatePlan, updateSession } from './trainingApi';
import type { PlannedSession } from './types';
import { formatDateLong, formatDateShort } from './dateUtils';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Calendar from '../../components/Calendar';
import GpxUploader from './GpxUploader';
import { useAuth } from '../auth/useAuth';

export default function TrainingPage() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const [goalInput, setGoalInput] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showGpxUploader, setShowGpxUploader] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null);
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'upcoming' | 'history' | 'custom'>('all');

  // First, get the current plan metadata
  const {
    data: planMetadata,
    isLoading: isLoadingMetadata,
    isError: isMetadataError,
    error: metadataError,
  } = useQuery({
    queryKey: ['trainingPlanMetadata'],
    queryFn: getCurrentPlan,
    retry: false,
  });

  // Calculate date range based on plan dates and filter mode
  const dateRange = useMemo(() => {
    if (!planMetadata) return null;
    
    const today = new Date().toISOString().split('T')[0];
    
    switch (dateRangeMode) {
      case 'upcoming':
        return {
          from: today,
          to: planMetadata.endDate,
        };
      case 'history':
        return {
          from: planMetadata.startDate,
          to: today,
        };
      case 'custom':
        return customDateRange || {
          from: planMetadata.startDate,
          to: planMetadata.endDate,
        };
      default:
        return {
          from: planMetadata.startDate,
          to: planMetadata.endDate,
        };
    }
  }, [planMetadata, dateRangeMode, customDateRange]);

  // Fetch sessions when we have a date range
  const {
    data: planDetails,
    isLoading: isLoadingSessions,
    isError: isSessionsError,
  } = useQuery({
    queryKey: ['trainingPlanSessions', dateRange],
    queryFn: () => getPlanWithSessions(dateRange!.from, dateRange!.to),
    enabled: !!dateRange,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => generatePlan(goalInput.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingPlanMetadata'] });
      queryClient.invalidateQueries({ queryKey: ['trainingPlanSessions'] });
      setGenerateError(null);
    },
    onError: () => setGenerateError('Failed to generate plan.'),
  });

  const sessionMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: number; status: 'COMPLETED' | 'SKIPPED' }) =>
      updateSession(sessionId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainingPlanSessions'] });
    },
  });

  // Combine all sessions for calendar display
  const allSessions = useMemo(() => {
    if (!planDetails) return [];
    return [...planDetails.completedSessions, ...planDetails.trainingPlan];
  }, [planDetails]);

  const selectedDateSessions = useMemo(() => {
    if (!allSessions.length || !selectedDate) return [];
    return allSessions.filter((session) => {
      const sessionDate = session.scheduledDate.split('T')[0];
      return sessionDate === selectedDate;
    });
  }, [allSessions, selectedDate]);

  const noActivePlan =
    isMetadataError &&
    (metadataError as { response?: { status?: number } })?.response?.status === 404;

  const isLoading = isLoadingMetadata || isLoadingSessions;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>🚴 Training Plan</h1>
        <p style={styles.subtitle}>Plan, track, and achieve your cycling goals</p>
      </div>

      {/* Generate Plan Section */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>✨ Generate New Plan</h2>
        <p style={styles.cardSubtitle}>Create a personalized training plan based on your goals</p>
        <div style={styles.generateRow}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="text"
            placeholder="Enter your goal (e.g., General Fitness, Century Ride, Race Preparation)"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
          />
          <button
            style={styles.button}
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? '⏳ Generating…' : '🎯 Generate Plan'}
          </button>
        </div>
        {generateError && <ErrorMessage message={generateError} />}
      </div>

      {/* GPX Upload Section */}
      {userId && (
        <div>
          <div style={styles.gpxToggleContainer}>
            <button
              style={styles.gpxToggleButton}
              onClick={() => setShowGpxUploader(!showGpxUploader)}
            >
              {showGpxUploader ? '▼ Hide GPX Analyzer' : '▶ Upload & Analyze GPX Route'}
            </button>
          </div>
          {showGpxUploader && <GpxUploader userId={userId} />}
        </div>
      )}

      {/* Current Plan Section */}
      {isLoading && <LoadingSpinner />}

      {noActivePlan && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>No Active Training Plan</h3>
          <p style={styles.emptyText}>
            Generate a new training plan above to get started on your cycling journey!
          </p>
        </div>
      )}

      {isMetadataError && !noActivePlan && (
        <ErrorMessage message="Failed to load training plan." />
      )}
      {isSessionsError && <ErrorMessage message="Failed to load training sessions." />}

      {planMetadata && (
        <div>
          {/* Plan Header */}
          <div style={styles.planCard}>
            <div style={styles.planHeader}>
              <div style={styles.planHeaderLeft}>
                <h2 style={styles.planTitle}>📊 Current Plan</h2>
                <div style={styles.planMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Goal:</span>
                    <span style={styles.metaValue}>{planMetadata.goal}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Period:</span>
                    <span style={styles.metaValue}>
                      {formatDateShort(planMetadata.startDate)} →{' '}
                      {formatDateShort(planMetadata.endDate)}
                    </span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Status:</span>
                    <span style={statusBadgeStyle(planMetadata.status)}>{planMetadata.status}</span>
                  </div>
                </div>
              </div>
              {planDetails && (
                <div style={styles.statsContainer}>
                  <div style={styles.statBox}>
                    <div style={styles.statNumber}>{planDetails.completedSessions.length}</div>
                    <div style={styles.statLabel}>Completed</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={styles.statNumber}>{planDetails.trainingPlan.length}</div>
                    <div style={styles.statLabel}>Planned</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Range Filter */}
          <div style={styles.filterCard}>
            <h3 style={styles.filterTitle}>📅 View Sessions</h3>
            <div style={styles.filterButtons}>
              <button
                style={dateRangeMode === 'all' ? styles.filterButtonActive : styles.filterButton}
                onClick={() => setDateRangeMode('all')}
              >
                All Sessions
              </button>
              <button
                style={dateRangeMode === 'upcoming' ? styles.filterButtonActive : styles.filterButton}
                onClick={() => setDateRangeMode('upcoming')}
              >
                Upcoming Rides
              </button>
              <button
                style={dateRangeMode === 'history' ? styles.filterButtonActive : styles.filterButton}
                onClick={() => setDateRangeMode('history')}
              >
                History
              </button>
              <button
                style={dateRangeMode === 'custom' ? styles.filterButtonActive : styles.filterButton}
                onClick={() => setDateRangeMode('custom')}
              >
                Custom Range
              </button>
            </div>
            
            {dateRangeMode === 'custom' && (
              <div style={styles.customRangeInputs}>
                <div style={styles.customRangeField}>
                  <label style={styles.customRangeLabel}>From:</label>
                  <input
                    type="date"
                    style={styles.customRangeInput}
                    value={customDateRange?.from || planMetadata.startDate}
                    onChange={(e) => setCustomDateRange({
                      from: e.target.value,
                      to: customDateRange?.to || planMetadata.endDate,
                    })}
                  />
                </div>
                <div style={styles.customRangeField}>
                  <label style={styles.customRangeLabel}>To:</label>
                  <input
                    type="date"
                    style={styles.customRangeInput}
                    value={customDateRange?.to || planMetadata.endDate}
                    onChange={(e) => setCustomDateRange({
                      from: customDateRange?.from || planMetadata.startDate,
                      to: e.target.value,
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Calendar and Details Layout */}
          {allSessions.length > 0 && (
            <div style={styles.calendarSection}>
              <div style={styles.calendarContainer}>
                <h3 style={styles.sectionTitle}>📅 Training Calendar</h3>
                <Calendar
                  startDate={planMetadata.startDate}
                  sessions={allSessions}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>

              {selectedDate && selectedDateSessions.length > 0 && (
                <div style={styles.detailsContainer}>
                  <h3 style={styles.sectionTitle}>
                    {formatDateLong(selectedDate)}
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
                    {formatDateLong(selectedDate)}
                  </h3>
                  <div style={styles.emptyDateState}>
                    <p style={styles.emptyDateIcon}>🌤️</p>
                    <p style={styles.emptyDateText}>Rest day - No training sessions scheduled</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {allSessions.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <p style={styles.emptyText}>No sessions available for this plan.</p>
            </div>
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
      <div style={styles.sessionMain}>
        <div style={styles.sessionHeader}>
          <div style={styles.sessionType} aria-label={`Session type: ${session.type}`}>
            {getActivityIcon(session.type)} {session.type}
          </div>
          <span style={statusBadgeStyle(session.status)} aria-label={`Status: ${session.status}`}>{session.status}</span>
        </div>

        <div style={styles.sessionDetails}>
          {session.distance != null && (
            <div style={styles.detailItem} aria-label={`Distance: ${session.distance} kilometers`}>
              <span style={styles.detailIcon} aria-hidden="true">📏</span>
              <span style={styles.detailText}>{session.distance} km</span>
            </div>
          )}
          {session.duration != null && (
            <div style={styles.detailItem} aria-label={`Duration: ${session.duration} minutes`}>
              <span style={styles.detailIcon} aria-hidden="true">⏱️</span>
              <span style={styles.detailText}>{session.duration} min</span>
            </div>
          )}
          {session.intensity && (
            <div style={styles.detailItem} aria-label={`Intensity: ${session.intensity}`}>
              <span style={styles.detailIcon} aria-hidden="true">💪</span>
              <span style={styles.detailText}>{session.intensity}</span>
            </div>
          )}
          {session.tss != null && (
            <div style={styles.detailItem} aria-label={`Training Stress Score: ${session.tss}`}>
              <span style={styles.detailIcon} aria-hidden="true">📈</span>
              <span style={styles.detailText}>TSS: {session.tss}</span>
            </div>
          )}
          {session.elevation != null && (
            <div style={styles.detailItem} aria-label={`Elevation gain: ${session.elevation} meters`}>
              <span style={styles.detailIcon} aria-hidden="true">⛰️</span>
              <span style={styles.detailText}>{session.elevation}m</span>
            </div>
          )}
          {session.targetZone && (
            <div style={styles.detailItem} aria-label={`Target zone: ${session.targetZone}`}>
              <span style={styles.detailIcon} aria-hidden="true">🎯</span>
              <span style={styles.detailText}>Zone {session.targetZone}</span>
            </div>
          )}
        </div>

        {isActionable && (
          <div style={styles.sessionActions}>
            <button
              style={{ ...styles.actionBtn, ...styles.completeBtn }}
              onClick={() => onAction('COMPLETED')}
              disabled={isUpdating}
            >
              ✓ Complete
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.skipBtn }}
              onClick={() => onAction('SKIPPED')}
              disabled={isUpdating}
            >
              ⊘ Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    'ENDURANCE_RIDE': '🚴',
    'INTERVAL_TRAINING': '⚡',
    'HILL_CLIMBING': '⛰️',
    'RECOVERY_RIDE': '🌿',
    'TEMPO_RIDE': '🏃',
    'SPRINT_TRAINING': '💨',
  };
  return icons[type] || '🚴';
}

function statusBadgeStyle(status: string): React.CSSProperties {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    ACTIVE: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
    COMPLETED: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    SKIPPED: { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
    PLANNED: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  };
  const c = colors[status] ?? { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
  return {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    whiteSpace: 'nowrap',
    display: 'inline-block',
  };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  heading: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '1.1rem',
  },
  card: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.2)',
    color: '#fff',
  },
  cardTitle: {
    margin: '0 0 0.5rem',
    color: '#fff',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  cardSubtitle: {
    margin: '0 0 1.5rem',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.95rem',
  },
  generateRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.95)',
    color: '#111827',
  },
  button: {
    padding: '0.75rem 1.5rem',
    background: '#fff',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s',
  },
  emptyState: {
    background: '#f9fafb',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    margin: '0 0 0.5rem',
    color: '#374151',
    fontSize: '1.5rem',
  },
  emptyText: {
    margin: 0,
    color: '#6b7280',
    fontSize: '1rem',
  },
  planCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
  },
  planHeaderLeft: {
    flex: 1,
  },
  planTitle: {
    margin: '0 0 1.5rem',
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  planMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metaLabel: {
    fontWeight: 600,
    color: '#6b7280',
    minWidth: '80px',
  },
  metaValue: {
    color: '#111827',
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem',
  },
  statBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '1.5rem',
    minWidth: '120px',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  calendarSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  calendarContainer: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  detailsContainer: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    margin: '0 0 1.5rem',
    color: '#111827',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sessionCard: {
    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  sessionMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionType: {
    fontWeight: 600,
    color: '#111827',
    fontSize: '1.05rem',
  },
  sessionDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.75rem',
    background: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  detailIcon: {
    fontSize: '1rem',
  },
  detailText: {
    color: '#374151',
    fontWeight: 500,
  },
  sessionActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'transform 0.2s',
  },
  completeBtn: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  skipBtn: {
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  emptyDateState: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  emptyDateIcon: {
    fontSize: '3rem',
    margin: '0 0 0.5rem',
  },
  emptyDateText: {
    margin: 0,
    color: '#6b7280',
  },
};
