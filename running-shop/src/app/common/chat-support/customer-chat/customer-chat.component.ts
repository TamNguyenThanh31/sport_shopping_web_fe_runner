import {Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {SupportSession} from "../../../shared/models/support-session.model";
import {Subscription} from "rxjs";
import {Message} from "../../../shared/models/message.model";
import {ChatService} from "../../service/chat.service";
import { MessageService as ToastService, PrimeNGConfig } from 'primeng/api';
import {AuthService} from "../../../core/services/auth.service";
import {WebSocketService} from "../../../core/services/websocket.service";
import {CardModule} from "primeng/card";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {ScrollPanelModule} from "primeng/scrollpanel";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";

@Component({
  selector: 'app-customer-chat',
  standalone: true,
  imports: [
    CardModule,
    NgIf,
    ScrollPanelModule,
    NgForOf,
    NgClass,
    InputTextareaModule,
    FormsModule,
    DatePipe,
    ButtonDirective
  ],
  templateUrl: './customer-chat.component.html',
  styleUrl: './customer-chat.component.scss'
})
export class CustomerChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  session!: SupportSession;
  messages: Message[] = [];
  newMessageContent = '';
  messagesWithDate: any[] = [];

  private msgSub!: Subscription;
  private notifSub!: Subscription;

  @ViewChild('messageInput') messageInput: ElementRef | undefined;
  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('scrollPanel') scrollPanel: any;

  constructor(
    private chatService: ChatService,
    private wsService: WebSocketService,
    private toast: ToastService,
    private primengConfig: PrimeNGConfig,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.primengConfig.ripple = true;

    // 1. Mở (hoặc lấy) session
    this.chatService.openSession().subscribe({
      next: sess => {
        this.session = sess;

        // 2. Kết nối WebSocket
        this.wsService.connect();

        // Đợi một chút cho STOMP active rồi subscribe
        setTimeout(() => {
          this.wsService.subscribeToSession(this.session.id);
          this.wsService.subscribeToNotifications();

          // 3. Load lịch sử chat
          this.chatService.getMessages(this.session.id).subscribe({
            next: msgs => {
              this.messages = msgs;
              this.messagesWithDate = this.addDateLabels(this.messages);
              this.scrollToBottom();
            },
            error: err => console.error('Load message history error', err)
          });

          // 4. Lắng nghe message mới realtime
          this.msgSub = this.wsService.onMessage().subscribe(msg => {
            if (msg.sessionId === this.session.id) {
              this.messages.push(msg);
              this.messagesWithDate = this.addDateLabels(this.messages);
              this.scrollToBottom();
            }
          });

          // 5. Lắng nghe notification
          this.notifSub = this.wsService.onNotification().subscribe(text => {
            this.toast.add({severity:'info', summary:'Thông báo', detail: text, life:5000});
          });
        }, 500);

      },
      error: err => console.error('Open session error', err)
    });
  }

  sendMessage(): void {
    const content = this.newMessageContent.trim();
    if (!content) return;

    const msg: Message = {
      sessionId: this.session.id,
      senderId: this.authService.getUserId()!,
      receiverId: this.session.staffId || 0,
      content: content
    };
    this.wsService.sendMessage(msg);
    this.newMessageContent = '';
  }

  closeChat(): void {
    this.chatService.closeSession(this.session.id).subscribe({
      next: () => {
        this.toast.add({severity:'warn', summary:'Đã đóng', detail:'Bạn đã kết thúc trò chuyện.', life:3000});
        this.wsService.disconnect();
        this.messages = [];
      },
      error: err => console.error('Close session error', err)
    });
  }

  private scrollToBottom(): void {
    try {
      this.scrollPanel?.el?.children[0]?.scrollTo({
        top: this.scrollPanel.el.children[0].scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {}
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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // Thêm hàm để chèn label ngày vào giữa các tin nhắn
  addDateLabels(messages: Message[]): any[] {
    if (!messages.length) return [];
    const result: any[] = [];
    let lastDate = '';
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const msgDate = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '';
      if (msgDate && msgDate !== lastDate) {
        result.push({ isDate: true, date: msg.timestamp });
        lastDate = msgDate;
      }
      result.push({ isDate: false, msg });
    }
    return result;
  }
}
