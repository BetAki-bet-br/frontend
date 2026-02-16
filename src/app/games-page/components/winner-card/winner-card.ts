import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Winner } from '../winners-list/winner.model';
import { CurrencyPipe } from '@angular/common';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';

@Component({
  selector: 'app-winner-card',
  imports: [CurrencyPipe, CdnizePipe],
  templateUrl: './winner-card.html',
  styleUrl: './winner-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnerCard {
  winner = input.required<Winner>();
}
