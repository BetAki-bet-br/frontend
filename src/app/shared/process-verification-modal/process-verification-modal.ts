import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '@/app/core/services/modal.service';
import { ModalComponent } from '@shared/modal/modal';
import { PlayerService } from '@/app/core/services/player.service';

@Component({
  selector: 'app-process-verification-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './process-verification-modal.html',
  styleUrl: './process-verification-modal.scss',
})
export class ProcessVerificationModalComponent {
  isOpen = input.required<boolean>();
  closeModal = output<void>();
  router = inject(Router);
  modalService = inject(ModalService);
  playerService = inject(PlayerService);

  playerStatuses = this.playerService.playerStatuses;

  isKycVerified = computed(() => this.playerStatuses()?.kycStatus ?? false);
  isAddressVerified = computed(() => this.playerStatuses()?.address ?? false);
  isEmailVerified = computed(() => this.playerStatuses()?.email ?? false);

  onClose() {
    this.closeModal.emit();
  }

  goToEmailVerification() {
    console.log('navegar para a verificação de email');
    this.router.navigate(['/auth/email/verification']);
    this.onClose();
  }

  openKycVerificationModal() {
    this.onClose();
    this.modalService.open('kycVerification');
  }
}
