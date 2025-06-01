export interface SupportSession {
  id: number;
  customerId: number;
  staffId: number | null;
  startedAt: string;    // ISO datetime
  endedAt: string | null;
  lastMessage: string | null;
  lastActivity: string | null;
}
