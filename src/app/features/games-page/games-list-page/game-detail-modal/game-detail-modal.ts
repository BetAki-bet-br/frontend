import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GameMain } from '@/app/core/models/game.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-game-detail-modal',
  templateUrl: './game-detail-modal.html',
  styleUrls: ['./game-detail-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class GameDetailModal {
  game = input.required<GameMain>();
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}
