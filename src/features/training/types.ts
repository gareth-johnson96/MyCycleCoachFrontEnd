export interface TrainingPlanResponse {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  goal: string;
  status: string;
  sessions?: PlannedSession[];
}

export interface PlannedSession {
  id: number;
  scheduledDate: string;
  type: string;
  distance: number | null;
  duration: number | null;
  intensity: string;
  status: string;
  completedAt: string | null;
}

export interface CompleteSessionRequest {
  status: 'COMPLETED' | 'SKIPPED';
}
