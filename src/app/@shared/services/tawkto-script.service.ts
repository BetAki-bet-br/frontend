import { Injectable, inject } from '@angular/core';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class TawkToScriptService {
  private chatService = inject(ChatService);

  maximize() {
    this.chatService.showChat();
  }
}
