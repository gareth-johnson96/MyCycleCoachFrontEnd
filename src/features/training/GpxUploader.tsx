import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadGpxFile } from './trainingApi';
import type { GpxAnalysisResponse } from './types';
import ErrorMessage from '../../components/ErrorMessage';

interface GpxUploaderProps {
  userId: number;
}

export default function GpxUploader({ userId }: GpxUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<GpxAnalysisResponse | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadGpxFile(file, userId),
    onSuccess: (data) => {
      setAnalysis(data);
      setSelectedFile(null);
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
    }
  }

  function handleUpload() {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  }

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  function formatGradient(gradient: number): string {
    return `${(gradient * 100).toFixed(1)}%`;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 GPX Route Analysis</h2>
      <p style={styles.subtitle}>
        Upload a GPX file to analyze route details, climbs, and estimated ride time
      </p>

      <div style={styles.uploadSection}>
        <label style={styles.fileLabel}>
          <input
            type="file"
            accept=".gpx"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <div style={styles.fileButton}>
            📁 {selectedFile ? selectedFile.name : 'Choose GPX File'}
          </div>
        </label>

        {selectedFile && (
          <button
            style={styles.uploadButton}
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? '⏳ Analyzing...' : '🚀 Upload & Analyze'}
          </button>
        )}
      </div>

      {uploadMutation.isError && (
        <ErrorMessage message="Failed to analyze GPX file. Please ensure it's a valid GPX file." />
      )}

      {analysis && (
        <div style={styles.analysisCard}>
          <h3 style={styles.analysisTitle}>📈 Route Analysis: {analysis.filename}</h3>

          {/* Summary Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>📏</div>
              <div style={styles.statValue}>{analysis.totalDistanceKm.toFixed(1)} km</div>
              <div style={styles.statLabel}>Total Distance</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>⏱️</div>
              <div style={styles.statValue}>{formatTime(analysis.estimatedRideTimeMinutes)}</div>
              <div style={styles.statLabel}>Estimated Time</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>⛰️</div>
              <div style={styles.statValue}>{analysis.climbCount}</div>
              <div style={styles.statLabel}>Climbs Detected</div>
            </div>
          </div>

          {/* Climbs Details */}
          {analysis.climbs.length > 0 && (
            <div style={styles.climbsSection}>
              <h4 style={styles.climbsTitle}>🏔️ Climb Details</h4>
              <div style={styles.climbsList}>
                {analysis.climbs.map((climb, index) => (
                  <div key={climb.id} style={styles.climbCard}>
                    <div style={styles.climbHeader}>
                      <span style={styles.climbNumber}>Climb {index + 1}</span>
                      <span style={styles.climbGradient}>
                        Avg: {formatGradient(climb.averageGradient)}
                      </span>
                    </div>
                    <div style={styles.climbDetails}>
                      <div style={styles.climbDetail}>
                        <span style={styles.climbDetailIcon}>📏</span>
                        <span style={styles.climbDetailText}>
                          {(climb.distanceMeters / 1000).toFixed(2)} km
                        </span>
                      </div>
                      <div style={styles.climbDetail}>
                        <span style={styles.climbDetailIcon}>⬆️</span>
                        <span style={styles.climbDetailText}>
                          {climb.elevationGainMeters.toFixed(0)}m gain
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.climbs.length === 0 && (
            <div style={styles.noClimbs}>
              <p style={styles.noClimbsIcon}>🌤️</p>
              <p style={styles.noClimbsText}>
                No significant climbs detected (flat route or minimal elevation changes)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  title: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  subtitle: {
    margin: '0 0 1.5rem',
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  uploadSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  fileLabel: {
    flex: 1,
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  fileButton: {
    padding: '0.75rem 1.5rem',
    background: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#374151',
    textAlign: 'center',
    transition: 'background 0.2s, border-color 0.2s',
  },
  uploadButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s',
  },
  analysisCard: {
    background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginTop: '1rem',
  },
  analysisTitle: {
    margin: '0 0 1.5rem',
    color: '#111827',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statBox: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  climbsSection: {
    marginTop: '1.5rem',
  },
  climbsTitle: {
    margin: '0 0 1rem',
    color: '#111827',
    fontSize: '1rem',
    fontWeight: 600,
  },
  climbsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  climbCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
  },
  climbHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  climbNumber: {
    fontWeight: 600,
    color: '#111827',
    fontSize: '0.95rem',
  },
  climbGradient: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  climbDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  climbDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  climbDetailIcon: {
    fontSize: '1rem',
  },
  climbDetailText: {
    color: '#374151',
  },
  noClimbs: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  noClimbsIcon: {
    fontSize: '3rem',
    margin: '0 0 0.5rem',
  },
  noClimbsText: {
    margin: 0,
    color: '#6b7280',
  },
};
