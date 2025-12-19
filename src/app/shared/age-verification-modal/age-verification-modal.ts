import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { ModalComponent } from '../modal/modal';
import { AgeVerificationService } from '@/app/core/services/age-verification.service';
import { ModalService } from '@/app/core/services/modal.service';

@Component({
  selector: 'app-age-verification-modal',
  templateUrl: './age-verification-modal.html',
  styleUrls: ['./age-verification-modal.scss'],
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeVerificationModal {
  private readonly ageVerificationService = inject(AgeVerificationService);
  private readonly modalService = inject(ModalService);

  isOpen = this.modalService.isModalOpen('age-verification');

  constructor() {
    effect(() => {
      console.log('AgeVerificationModal isOpen:', this.isOpen());
    });
  }

  confirm(isOfAge: boolean): void {
    if (isOfAge) {
      this.ageVerificationService.setVerified(true);
      this.close();
    } else {
      window.location.href = 'https://www.google.com/search?q=safe+browsing';
    }
  }

  close(): void {
    this.modalService.close('age-verification');
  }
}
