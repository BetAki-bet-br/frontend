import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  customClass = input<string>('');
  innerCustomClass = input<string>('');
  showCloseButton = input<boolean>(true);
  closeModal = output<void>();

  onClose() {
    this.closeModal.emit();
  }
}
