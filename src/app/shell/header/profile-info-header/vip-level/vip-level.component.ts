import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-vip-level',
  templateUrl: './vip-level.component.html',
  styleUrls: ['./vip-level.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VipLevelComponent {
  @Input() vipLevelName = '/';
  @Input() vipCounter = 0;
  @Input() maxVipCounter = 200;

  getVipValue(): number {
    return (this.vipCounter / this.maxVipCounter) * 100;
  }
}
