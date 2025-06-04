import {Component, OnDestroy, OnInit} from '@angular/core';
import {SupportSession} from "../../../shared/models/support-session.model";
import {Message} from "../../../shared/models/message.model";
import {Subscription} from "rxjs";
import {AuthService} from "../../../core/services/auth.service";
import { MessageService as ToastService, PrimeNGConfig, Message as PrimeMessage } from 'primeng/api';
import {PanelModule} from "primeng/panel";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ToastModule} from "primeng/toast";
import {ChatService} from "../../service/chat.service";
import {WebSocketService} from "../../../core/services/websocket.service";
import {CardModule} from "primeng/card";
import {ScrollPanelModule} from "primeng/scrollpanel";
import {ButtonDirective} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";

@Component({
  selector: 'app-staff-chat',
  standalone: true,
  imports: [
    PanelModule,
    NgForOf,
    FormsModule,
    ToastModule,
    NgIf,
    CardModule,
    ScrollPanelModule,
    NgClass,
    DatePipe,
    InputTextareaModule,
    ButtonDirective
  ],
  templateUrl: './staff-chat.component.html',
  styleUrl: './staff-chat.component.scss'
})
export class StaffChatComponent implements OnInit, OnDestroy {
  waitingSessions: SupportSession[] = [];
  mySessions: SupportSession[] = [];
  selectedSession?: SupportSession;
  messages: Message[] = [];
  newMessageContent = '';

  private msgSub!: Subscription;
  private notifSub!: Subscription;

  constructor(
    private chatService: ChatService,
    private wsService: WebSocketService,
    private toast: ToastService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    // 1. Kết nối WebSocket
    this.wsService.connect();

    setTimeout(() => {
      // 2. Subscribe notifications
      this.wsService.subscribeToNotifications();

      // 3. Lấy session chờ và session hiện tại
      this.loadWaitingSessions();
      this.loadMySessions();

      // 4. Lắng nghe message mới
      this.msgSub = this.wsService.onMessage().subscribe(msg => {
        if (this.selectedSession && msg.sessionId === this.selectedSession.id) {
          this.messages.push(msg);
          setTimeout(() => this.scrollToBottom(), 100);
        }
      });

      // 5. Lắng nghe notification
      this.notifSub = this.wsService.onNotification().subscribe(text => {
        this.toast.add({severity:'info', summary:'Thông báo', detail: text, life:5000});
        this.loadWaitingSessions();
        this.loadMySessions();
      });
    }, 500);
  }

  /** Tải session chờ */
  loadWaitingSessions(): void {
    this.chatService.getWaitingSessions().subscribe({
      next: list => this.waitingSessions = list,
      error: err => console.error('Load waiting sessions error', err)
    });
  }

  /** Tải session đã được assign cho staff (active) */
  loadMySessions(): void {
    this.chatService.getActiveSessions().subscribe({
      next: list => {
        const userId = this.authService.getUserId();
        this.mySessions = list.filter(s => s.staffId === userId);
      },
      error: err => console.error('Load my sessions error', err)
    });
  }

  /** Khi click chọn 1 session chờ hoặc session của tôi */
  selectSession(session: SupportSession, isWaiting: boolean): void {
    this.selectedSession = session;

    if (isWaiting) {
      this.chatService.assignSession(session.id).subscribe({
        next: updated => {
          this.selectedSession = updated;
          if (updated.staffId) {
            // đã assign xong, staffId đã có
            this.toast.add({ severity:'success', summary:'Đã nhận', detail:`Bạn đã nhận session #${session.id}` });
            this.loadWaitingSessions();
            this.loadMySessions();
            this.subscribeAndLoadMessages(updated.id);
          } else {
            // staffId vẫn null, đợi thêm một chút rồi gọi lại
            setTimeout(() => this.subscribeAndLoadMessages(session.id), 100);
          }
        },
        error: err => {
          console.error('Assign session error', err);
          this.toast.add({ severity:'error', summary:'Lỗi', detail:'Không thể nhận session' });
        }
      });
    } else {
      // Nếu staff click vào một session đã assign (trong mySessions),
      // tức staffId đã đúng, chỉ việc subscribe + load messages
      this.subscribeAndLoadMessages(session.id);
    }
  }


  private subscribeAndLoadMessages(sessionId: number): void {
    this.wsService.subscribeToSession(sessionId);
    this.chatService.getMessages(sessionId).subscribe({
      next: msgs => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: err => console.error('Load messages error', err)
    });
  }

  sendMessage(): void {
    const content = this.newMessageContent.trim();
    if (!content || !this.selectedSession) return;

    const msg: Message = {
      sessionId: this.selectedSession.id,
      senderId: this.authService.getUserId()!,
      receiverId: this.selectedSession.customerId,
      content: content
    };
    this.wsService.sendMessage(msg);
    this.newMessageContent = '';
  }

  closeChat(): void {
    if (!this.selectedSession) return;
    this.chatService.closeSession(this.selectedSession.id).subscribe({
      next: () => {
        this.toast.add({severity:'warn', summary:'Session Đóng', detail:`Session #${this.selectedSession!.id} đã kết thúc`, life:3000});
        this.wsService.unsubscribeFromSession(this.selectedSession!.id);
        this.selectedSession = undefined;
        this.messages = [];
        this.loadWaitingSessions();
        this.loadMySessions();
      },
      error: err => console.error('Close session error', err)
    });
  }

  private scrollToBottom(): void {
    const el = document.getElementById('messageListStaff');
    if (el) {
      setTimeout(() => el.scrollTop = el.scrollHeight, 50);
    }
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  ngOnDestroy(): void {
    if (this.msgSub) this.msgSub.unsubscribe();
    if (this.notifSub) this.notifSub.unsubscribe();
    this.wsService.disconnect();
  }
}
