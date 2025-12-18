import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { VipProgram } from '@app/@shared/models';

@Component({
  selector: 'app-vip-program-card',
  templateUrl: './vip-program-card.component.html',
  styleUrls: ['./vip-program-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VipProgramCardComponent {
  @Input() program?: VipProgram;

  constructor(public dataStoreService: DataStoreService) {}
}
