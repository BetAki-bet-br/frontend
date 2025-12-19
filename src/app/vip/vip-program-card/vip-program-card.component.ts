import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { VipProgram } from '@app/@shared/models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vip-program-card',
  templateUrl: './vip-program-card.component.html',
  styleUrls: ['./vip-program-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, CurrencyPipe, PercentPipe, CdnizePipe, TranslateModule],
})
export class VipProgramCardComponent {
  dataStoreService = inject(DataStoreService);

  @Input() program?: VipProgram;
}
