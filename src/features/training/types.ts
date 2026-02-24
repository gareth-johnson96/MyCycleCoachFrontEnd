export interface TrainingPlanResponse {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  goal: string;
  status: string;
}

export interface TrainingPlanDetailResponse {
  id: number;
  userId: number;
  completedSessions: PlannedSession[];
  trainingPlan: PlannedSession[];
}

export interface PlannedSession {
  id: number;
  planId: number;
  scheduledDate: string;
  type: string;
  distance: number | null;
  duration: number | null;
  intensity: string;
  status: string;
  /** Training Stress Score - a measure of training load (typically 0-300) */
  tss: number | null;
  /** Elevation gain in meters */
  elevation: number | null;
  /** Target heart rate or power zone (e.g., 'Z1', 'Z2', 'Z3', 'Z4', 'Z5') */
  targetZone: string | null;
}

export interface CompleteSessionRequest {
  status: 'COMPLETED' | 'SKIPPED';
}

export interface GpxClimb {
  id: number;
  distanceMeters: number;
  elevationGainMeters: number;
  averageGradient: number;
  startPointIndex: number;
  endPointIndex: number;
}

export interface GpxAnalysisResponse {
  gpxFileId: number;
  filename: string;
  climbCount: number;
  climbs: GpxClimb[];
  totalDistanceKm: number;
  estimatedRideTimeMinutes: number;
  uploadedAt: string;
}

export interface GpxFileResponse {
  id: number;
  filename: string;
  userId: number;
  uploadedAt: string;
}
