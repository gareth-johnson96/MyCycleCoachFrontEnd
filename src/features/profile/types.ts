export interface ProfileResponse {
  id: number;
  userId: number;
  age: number | null;
  weight: number | null;
  experienceLevel: string | null;
}

export interface UpdateProfileRequest {
  age: number;
  weight: number;
  experienceLevel: string;
}

export interface BackgroundRequest {
  yearsTraining: number;
  weeklyVolume: number;
  recentInjuries: string;
  priorEvents: string;
}

export interface GoalsRequest {
  goals: string;
}
