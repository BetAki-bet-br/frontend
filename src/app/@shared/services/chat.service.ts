import { Injectable, inject } from '@angular/core';
import { FonetalkScriptLoader } from './fonetalk-script-loader';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private fonetalkScriptLoader = inject(FonetalkScriptLoader);
  private document = inject(DOCUMENT);
  private _canShow = true;

  public readonly isReady$: Observable<boolean> = this.fonetalkScriptLoader.isReady$;

  constructor() {
    this.fonetalkScriptLoader.loadScript();
  }

  setCanShow(canShow: boolean) {
    this._canShow = canShow;
    if (!canShow) {
      this.hideChat();
    } else {
      this.showChat();
    }
  }

  showChat() {
    if (this._canShow) {
      this.fonetalkScriptLoader.showWidget();
    }
  }

  hideChat() {
    this.fonetalkScriptLoader.hideWidget();
  }

  isOpen(): boolean {
    const widget = this.document.querySelector('.rocketchat-widget');
    return widget?.getAttribute('data-state') === 'opened';
  }
}
