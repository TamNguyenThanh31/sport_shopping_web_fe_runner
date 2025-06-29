import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string; attachment?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotGeminiService {

  private apiKey = 'AIzaSyAnDD9Ws3hK8iG1psUHFSV5mASyZilAOeQ';
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  private history: ChatHistoryItem[] = [];

  constructor(private http: HttpClient) {}

  getHistory(): ChatHistoryItem[] {
    return this.history;
  }

  sendMessage(text: string, attachment?: string): Observable<string> {
    const item = { role: 'user' as const, parts: [{ text, attachment }] };
    this.history.push(item);
    const body = { contents: this.history };
    return this.http.post<any>(this.apiUrl, body).pipe(
      map(res => {
        const modelText = res.candidates[0].content.parts[0].text.trim();
        const modelAttachment = res.candidates[0].content.parts[0].inline_data?.data;
        this.history.push({ role: 'model', parts: [{ text: modelText, attachment: modelAttachment }] });
        return modelText;
      }),
      catchError(err => throwError(() => err))
    );
  }
}
