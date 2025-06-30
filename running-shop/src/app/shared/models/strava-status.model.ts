export interface StravaStatus {
  totalDistanceKm: number;
  averagePace: string;      // min:km
  availableKm: number;
  currentDiscount: number;  // 1000 đ
  nearLimit?: boolean;        // true nếu đã dùng ≥ warnThresholdPercent
  warningMessage?: string;    // thông điệp cảnh báo
}
