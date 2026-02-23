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
  tss: number | null;
  elevation: number | null;
  targetZone: string | null;
}

export interface CompleteSessionRequest {
  status: 'COMPLETED' | 'SKIPPED';
}
