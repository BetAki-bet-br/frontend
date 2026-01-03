import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GameMain } from '@app/games-page/models/game.models';

@Component({
  selector: 'app-game-detail-modal',
  templateUrl: './game-detail-modal.html',
  styleUrls: ['./game-detail-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, CurrencyPipe],
})
export class GameDetailModal {
  game = input.required<GameMain>();
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  volatilityRange = [1, 2, 3, 4, 5];

  onClose(): void {
    this.closeModal.emit();
  }
}
