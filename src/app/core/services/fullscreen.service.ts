import { Injectable, signal, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FullscreenService implements OnDestroy {
  readonly isFullscreen = signal(!!document.fullscreenElement);

  constructor() {
    document.addEventListener('fullscreenchange', this.fullscreenChangeListener);
  }

  private fullscreenChangeListener = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  ngOnDestroy() {
    document.removeEventListener(
      'fullscreenchange',
      this.fullscreenChangeListener
    );
  }

  toggle() {
    if (this.isFullscreen()) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    }
  }
}
