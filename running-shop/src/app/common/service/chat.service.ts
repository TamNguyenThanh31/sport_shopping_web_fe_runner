import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SupportSession} from "../../shared/models/support-session.model";
import {Observable} from "rxjs";
import {Message} from "../../shared/models/message.model";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly BASE_URL = 'http://localhost:8080/api/sessions';

  constructor(private http: HttpClient) {}

  /** Customer mở chat (hoặc lấy session active nếu đã có) */
  openSession(): Observable<SupportSession> {
    return this.http.post<SupportSession>(`${this.BASE_URL}/open`, {});
  }

  /** Staff lấy danh sách session chờ */
  getWaitingSessions(): Observable<SupportSession[]> {
    return this.http.get<SupportSession[]>(`${this.BASE_URL}/available`);
  }

  /** User (Customer/Staff) lấy danh sách session active của mình */
  getActiveSessions(): Observable<SupportSession[]> {
    return this.http.get<SupportSession[]>(`${this.BASE_URL}/active`);
  }

  /** Staff assign session */
  assignSession(sessionId: number): Observable<SupportSession> {
    return this.http.post<SupportSession>(`${this.BASE_URL}/${sessionId}/assign`, {});
  }

  /** Customer hoặc Staff đóng session */
  closeSession(sessionId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE_URL}/${sessionId}/close`, {});
  }

  /** Lấy lịch sử tin nhắn của session */
  getMessages(sessionId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.BASE_URL}/${sessionId}/messages`);
  }
}
