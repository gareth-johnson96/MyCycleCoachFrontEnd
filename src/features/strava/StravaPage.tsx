import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnectionStatus, getAuthorizationUrl, disconnect, syncRides, getRides } from './stravaApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import type { RideResponse } from './types';

export default function StravaPage() {
  const queryClient = useQueryClient();

  const { data: connection, isLoading: connectionLoading, error: connectionError } = useQuery({
    queryKey: ['strava', 'connection'],
    queryFn: getConnectionStatus,
    retry: false,
  });

  const { data: rides, isLoading: ridesLoading } = useQuery({
    queryKey: ['strava', 'rides'],
    queryFn: getRides,
    enabled: connection?.connected ?? false,
  });

  const authUrlMutation = useMutation({
    mutationFn: getAuthorizationUrl,
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strava'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncRides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strava', 'rides'] });
    },
  });

  function handleConnect() {
    authUrlMutation.mutate();
  }

  function handleDisconnect() {
    if (window.confirm('Are you sure you want to disconnect your Strava account?')) {
      disconnectMutation.mutate();
    }
  }

  function handleSync() {
    syncMutation.mutate();
  }

  if (connectionLoading) {
    return <LoadingSpinner />;
  }

  const isConnected = connection?.connected ?? false;
  const hasError = connectionError && !isConnected;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚴 Strava Integration</h1>
        <p style={styles.subtitle}>
          Connect your Strava account to automatically sync your cycling activities
        </p>
      </div>

      {hasError && (
        <div style={styles.notConnectedCard}>
          <div style={styles.stravaLogo}>
            <svg viewBox="0 0 24 24" style={styles.stravaIcon}>
              <path
                fill="#FC4C02"
                d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
              />
            </svg>
          </div>
          <h2 style={styles.cardTitle}>Connect to Strava</h2>
          <p style={styles.cardDescription}>
            Link your Strava account to automatically import your rides and track your training progress.
          </p>
          <button
            style={styles.connectButton}
            onClick={handleConnect}
            disabled={authUrlMutation.isPending}
          >
            {authUrlMutation.isPending ? '⏳ Redirecting...' : '🔗 Connect with Strava'}
          </button>
          {authUrlMutation.isError && (
            <ErrorMessage message="Failed to get authorization URL. Please try again." />
          )}
        </div>
      )}

      {isConnected && (
        <>
          <div style={styles.connectedCard}>
            <div style={styles.connectedHeader}>
              <div>
                <div style={styles.connectedBadge}>✅ Connected</div>
                <p style={styles.connectedText}>
                  Athlete ID: {connection?.stravaAthleteId} • Connected on{' '}
                  {connection?.connectedAt ? new Date(connection.connectedAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.syncButton}
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                >
                  {syncMutation.isPending ? '⏳ Syncing...' : '🔄 Sync Now'}
                </button>
                <button
                  style={styles.disconnectButton}
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? '⏳ Disconnecting...' : '❌ Disconnect'}
                </button>
              </div>
            </div>
            {syncMutation.isError && (
              <ErrorMessage message="Failed to sync rides. Please try again." />
            )}
            {syncMutation.isSuccess && (
              <div style={styles.successMessage}>
                ✅ Rides synced successfully!
              </div>
            )}
          </div>

          <div style={styles.ridesSection}>
            <h2 style={styles.ridesTitle}>📊 Your Strava Rides</h2>
            
            {ridesLoading && <LoadingSpinner />}
            
            {!ridesLoading && (!rides || rides.length === 0) && (
              <div style={styles.emptyState}>
                <p style={styles.emptyIcon}>🚴</p>
                <p style={styles.emptyText}>No rides found. Sync your Strava account to import your activities.</p>
              </div>
            )}

            {!ridesLoading && rides && rides.length > 0 && (
              <div style={styles.ridesList}>
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface RideCardProps {
  ride: RideResponse;
}

function RideCard({ ride }: RideCardProps) {
  function formatDistance(meters: number): string {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function formatSpeed(metersPerSecond: number): string {
    const kmh = metersPerSecond * 3.6;
    return `${kmh.toFixed(1)} km/h`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div style={styles.rideCard}>
      <div style={styles.rideHeader}>
        <h3 style={styles.rideName}>{ride.name}</h3>
        <span style={styles.rideDate}>{formatDate(ride.startDate)}</span>
      </div>
      
      <div style={styles.rideStats}>
        <div style={styles.rideStat}>
          <span style={styles.statIcon}>📏</span>
          <div>
            <div style={styles.statValue}>{formatDistance(ride.distance)}</div>
            <div style={styles.statLabel}>Distance</div>
          </div>
        </div>
        
        <div style={styles.rideStat}>
          <span style={styles.statIcon}>⏱️</span>
          <div>
            <div style={styles.statValue}>{formatTime(ride.movingTime)}</div>
            <div style={styles.statLabel}>Moving Time</div>
          </div>
        </div>
        
        <div style={styles.rideStat}>
          <span style={styles.statIcon}>⚡</span>
          <div>
            <div style={styles.statValue}>{formatSpeed(ride.averageSpeed)}</div>
            <div style={styles.statLabel}>Avg Speed</div>
          </div>
        </div>
        
        <div style={styles.rideStat}>
          <span style={styles.statIcon}>⛰️</span>
          <div>
            <div style={styles.statValue}>{ride.totalElevationGain.toFixed(0)}m</div>
            <div style={styles.statLabel}>Elevation</div>
          </div>
        </div>
      </div>

      {(ride.averageWatts || ride.averageHeartrate) && (
        <div style={styles.additionalStats}>
          {ride.averageWatts && (
            <span style={styles.additionalStat}>
              ⚡ {ride.averageWatts.toFixed(0)}W avg
            </span>
          )}
          {ride.averageHeartrate && (
            <span style={styles.additionalStat}>
              ❤️ {ride.averageHeartrate.toFixed(0)} bpm avg
            </span>
          )}
          {ride.maxHeartrate && (
            <span style={styles.additionalStat}>
              💥 {ride.maxHeartrate.toFixed(0)} bpm max
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '2rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '1.1rem',
  },
  notConnectedCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  stravaLogo: {
    marginBottom: '1.5rem',
  },
  stravaIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto',
  },
  cardTitle: {
    margin: '0 0 1rem',
    color: '#111827',
    fontSize: '1.75rem',
    fontWeight: 600,
  },
  cardDescription: {
    margin: '0 0 2rem',
    color: '#6b7280',
    fontSize: '1rem',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  connectButton: {
    padding: '1rem 2rem',
    background: '#FC4C02',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(252, 76, 2, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  connectedCard: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderRadius: '12px',
    border: '1px solid #86efac',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  connectedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  connectedBadge: {
    display: 'inline-block',
    background: '#22c55e',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  connectedText: {
    margin: 0,
    color: '#166534',
    fontSize: '0.95rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  syncButton: {
    padding: '0.75rem 1.5rem',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  disconnectButton: {
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  successMessage: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: '#22c55e',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  ridesSection: {
    marginTop: '2rem',
  },
  ridesTitle: {
    margin: '0 0 1.5rem',
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  emptyIcon: {
    fontSize: '4rem',
    margin: '0 0 1rem',
  },
  emptyText: {
    margin: 0,
    color: '#6b7280',
    fontSize: '1rem',
  },
  ridesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  rideCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  rideHeader: {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  rideName: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  rideDate: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  rideStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  rideStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statIcon: {
    fontSize: '1.5rem',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#111827',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  additionalStats: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  additionalStat: {
    fontSize: '0.875rem',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
  },
};
