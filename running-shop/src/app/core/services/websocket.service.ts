import { Injectable } from '@angular/core';
import {Client, IMessage, Stomp, StompSubscription} from '@stomp/stompjs';
import SockJS from "sockjs-client";
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import {AuthService} from "./auth.service";
import {Message} from "../../shared/models/message.model";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient!: Client;
  private connected$ = new BehaviorSubject<boolean>(false);

  /** Message mới realtime */
  private messageSubject = new BehaviorSubject<Message | null>(null);
  /** Notification từ server (text) */
  private notificationSubject = new BehaviorSubject<string | null>(null);

  private sessionSubscriptions = new Map<number, StompSubscription>();

  constructor(private authService: AuthService) {}

  /** Mở kết nối STOMP/SockJS */
  connect(): void {
    const token = this.authService.getToken();
    if (!token) { return; }

    this.stompClient = Stomp.over(() => new SockJS('http://localhost:8080/ws/support'));
    this.stompClient.debug = () => {};
    this.stompClient.connectHeaders = { Authorization: `Bearer ${token}` };

    this.stompClient.onConnect = frame => {
      console.log('WebSocket đã kết nối:', frame.headers['user-name']);
      // Bật cờ connected
      this.connected$.next(true);

      // Sau khi thực sự kết nối, bạn mới subscribe:
      // VD: this.subscribeToNotifications();
      //    this.subscribeToSession(currentSessionId);
    };

    this.stompClient.onStompError = frame => {
      console.error('STOMP error:', frame.headers['message'], frame.body);
    };
    this.stompClient.onWebSocketError = ev => {
      console.error('WebSocket error:', ev);
    };
    this.stompClient.reconnectDelay = 5000;
    this.stompClient.activate();
  }


  /** Ngắt kết nối WS */
  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      // Hủy tất cả subscription trước khi deactivate
      this.sessionSubscriptions.forEach(sub => sub.unsubscribe());
      this.sessionSubscriptions.clear();

      this.stompClient.deactivate();
      this.connected$.next(false);
      console.log('WebsocketService: WS đã ngắt kết nối');
    }
  }

  /** Subscribe nhận tin nhắn mới cho 1 session */
  subscribeToSession(sessionId: number): void {
    if (!this.stompClient || !this.stompClient.active) return;
    const topic = `/topic/session.${sessionId}`;
    if (this.sessionSubscriptions.has(sessionId)) {
      return; // Đã subscribe rồi
    }
    const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
      const msg: Message = JSON.parse(message.body);
      this.messageSubject.next(msg);
    });
    this.sessionSubscriptions.set(sessionId, subscription);
  }

  /** Hủy subscribe 1 session (nếu cần) */
  unsubscribeFromSession(sessionId: number): void {
    const sub = this.sessionSubscriptions.get(sessionId);
    if (sub) {
      sub.unsubscribe();
      this.sessionSubscriptions.delete(sessionId);
    }
  }

  /** Subscribe nhận notification cá nhân */
  subscribeToNotifications(): void {
    if (!this.stompClient || !this.stompClient.active) return;
    this.stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
      const text = message.body;
      this.notificationSubject.next(text);
    });
  }

  /** Gửi message mới lên server */
  sendMessage(msg: Message): void {
    if (!this.stompClient || !this.stompClient.active) {
      console.error('WebsocketService: STOMP chưa kết nối, không gửi được message.');
      return;
    }
    const payload = JSON.stringify(msg);
    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: payload
    });
  }

  /** Gửi markRead (nếu cần) */
  sendMarkRead(messageId: number): void {
    if (!this.stompClient || !this.stompClient.active) return;
    this.stompClient.publish({
      destination: '/app/chat.markRead',
      headers: { messageId: messageId.toString() }
    });
  }

  /** Trả về Observable message mới */
  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable().pipe(
      filter((msg): msg is Message => msg !== null)
    );
  }

  /** Trả về Observable notification */
  onNotification(): Observable<string> {
    return this.notificationSubject.asObservable().pipe(
      filter((text): text is string => text !== null)
    );
  }

  /** Trả trạng thái kết nối */
  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}
