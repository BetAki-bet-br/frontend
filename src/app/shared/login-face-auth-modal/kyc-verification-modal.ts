import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '@/app/core/services/auth.service';
import { Loading } from '@shared/loading/loading';
import { ModalComponent } from '@shared/modal/modal';

@Component({
  selector: 'app-login-face-auth-modal',
  standalone: true,
  imports: [Loading, ModalComponent],
  templateUrl: './login-face-auth-modal.html',
})
export class LoginFaceAuthModal {
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  isOpen = input.required<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  iframeUrl = signal<SafeResourceUrl | null>(null);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadIframeUrl();
      }
    });
  }

  loadIframeUrl() {
    this.isLoading.set(true);
    this.iframeUrl.set(null);
    this.authService.loginFaceAuth({}).subscribe({
      next: (response) => {
        if (response.url) {
          this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(response.url));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        // Handle error, maybe show a message
      },
    });
  }

  onClose() {
    this.closeModal.emit();
  }
}
