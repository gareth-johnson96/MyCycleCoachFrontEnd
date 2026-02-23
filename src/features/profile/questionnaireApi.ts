import { apiClient } from '../../lib/apiClient';

export interface QuestionnaireRequest {
  // User Profile fields
  age?: number;
  weight?: number;
  height?: number;
  experienceLevel?: string;
  currentFtp?: number;
  maxHr?: number;
  // Training Background fields
  yearsTraining?: number;
  weeklyVolume?: number;
  trainingHistory?: string;
  injuryHistory?: string;
  recentInjuries?: string;
  priorEvents?: string;
  dailyAvailability?: string;
  weeklyTrainingTimes?: string;
  // Training Goals fields
  goals: string;
  targetEvent?: string;
  targetEventDate?: string;
}

export async function submitQuestionnaire(data: QuestionnaireRequest): Promise<void> {
  await apiClient.post('/api/v1/user/questionnaire', data);
}
