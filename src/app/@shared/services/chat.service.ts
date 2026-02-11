import { Injectable, inject } from '@angular/core';
import { ChatbotScriptLoader } from './fonetalk-script-loader';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatbotScriptLoader = inject(ChatbotScriptLoader);
  private document = inject(DOCUMENT);
  public readonly isReady$: Observable<boolean> = this.chatbotScriptLoader.isReady$;

  constructor() {
    this.chatbotScriptLoader.loadScript();
  }

  showChat() {
    const link = document.createElement('a');
    link.href = '/assets/docs/Canais de atendimento _ Bet Aki.pdf';
    link.download = 'Canais de atendimento _ Bet Aki.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
