import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading = signal(false);
  inlineLoading = signal(false);
  loadingDelay = 1000; // milliseconds

  show() {
    this.loading.set(true);
  }

  hide() {
    this.loading.set(false);
  }

  showInline() {
    this.inlineLoading.set(true);
  }

  hideInline() {
    this.inlineLoading.set(false);
  }
}
