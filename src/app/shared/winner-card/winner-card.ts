import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Winner } from '../winners-list/winner.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-winner-card',
  imports: [CurrencyPipe],
  templateUrl: './winner-card.html',
  styleUrl: './winner-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnerCard {
  winner = input.required<Winner>();
}
