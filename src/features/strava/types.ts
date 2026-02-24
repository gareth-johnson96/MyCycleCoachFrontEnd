export interface StravaConnectionResponse {
  id: number;
  userId: number;
  stravaAthleteId: number;
  connected: boolean;
  connectedAt: string;
}

export interface RideResponse {
  id: number;
  stravaActivityId: number;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  startDate: string;
  averageSpeed: number;
  maxSpeed: number;
  averageWatts: number | null;
  averageHeartrate: number | null;
  maxHeartrate: number | null;
}
