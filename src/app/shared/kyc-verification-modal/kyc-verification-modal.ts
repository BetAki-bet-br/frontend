import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '@/app/core/services/auth.service';
import { ModalComponent } from '@shared/modal/modal';
import { LoadingService } from '../loading/loading.service';

@Component({
  selector: 'app-kyc-verification-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './kyc-verification-modal.html',
})
export class KycVerificationModal {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private loadingService = inject(LoadingService);

  isOpen = input.required<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  iframeUrl = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadIframeUrl();
      }
    });
  }

  loadIframeUrl() {
    this.loadingService.showInline();
    this.iframeUrl.set(null);
    this.authService.reverifyPlayer({}).subscribe({
      next: (response) => {
        if (response.url) {
          this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response.url));
        }
        this.loadingService.hideInline();
      },
      error: () => {
        this.loadingService.hideInline();
        // Handle error, maybe show a message
      },
    });
  }

  onClose() {
    this.closeModal.emit();
  }
}
