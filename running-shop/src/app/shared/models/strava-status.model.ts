export interface StravaStatus {
  totalDistanceKm: number;
  averagePace: string;      // mm:ss
  availableKm: number;
  currentDiscount: number;  // %
}
