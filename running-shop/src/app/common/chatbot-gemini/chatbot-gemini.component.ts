import {Component, HostListener} from '@angular/core';
import {ChatbotGeminiService, ChatHistoryItem} from "../service/chatbot-gemini.service";
import {Button, ButtonDirective} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {NgForOf, NgIf} from "@angular/common";
import {AvatarModule} from "primeng/avatar";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {InputTextareaModule} from "primeng/inputtextarea";
import {FormsModule} from "@angular/forms";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-chatbot-gemini',
  standalone: true,
  imports: [
    Button,
    DialogModule,
    NgForOf,
    NgIf,
    AvatarModule,
    ProgressSpinnerModule,
    InputTextareaModule,
    FormsModule,
    ButtonDirective
  ],
  templateUrl: './chatbot-gemini.component.html',
  styleUrl: './chatbot-gemini.component.scss'
})
export class ChatbotGeminiComponent {
  visible = false;
  message = '';
  loading = false;
  history: ChatHistoryItem[] = [];

  attachmentUrl: SafeUrl | null = null;
  attachmentData: string | null = null;
  showEmojiPicker = false;

  constructor(
    private chatService: ChatbotGeminiService,
    protected sanitizer: DomSanitizer
  ) {}

  toggleVisible() {
    this.visible = !this.visible;
    if (this.visible) this.history = this.chatService.getHistory();
    this.resetInput();
  }

  send() {
    if (!this.message.trim() && !this.attachmentData) return;
    this.loading = true;
    this.chatService.sendMessage(this.message, this.attachmentData || undefined).subscribe({
      next: () => {
        this.history = this.chatService.getHistory();
        this.resetInput();
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onFileChange(e: any) {
    const file: File = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.attachmentUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
      this.attachmentData = dataUrl.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  removeAttachment() {
    this.attachmentUrl = null;
    this.attachmentData = null;
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.message += event.emoji.native;
    this.showEmojiPicker = false;
  }

  onMaskClick() {
    this.visible = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.visible) this.toggleVisible();
  }

  private resetInput() {
    this.message = '';
    this.removeAttachment();
    this.showEmojiPicker = false;
  }
}
