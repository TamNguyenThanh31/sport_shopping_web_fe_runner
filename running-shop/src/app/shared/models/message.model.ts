export interface Message {
  id?: number;           // server gán khi lưu
  sessionId: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string;
}


