import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { VipService } from './vip.service';
import { VipProgram } from '@app/@shared/models';
import { VipProgramCardComponent } from './vip-program-card/vip-program-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  styleUrls: ['./vip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VipProgramCardComponent, TranslateModule],
})
export class VipComponent implements OnInit {
  private vipService = inject(VipService);

  vipPrograms: VipProgram[] = [];

  readMoreHidden = true;

  ngOnInit() {
    this.vipService.getAllVipPrograms().subscribe({
      next: (data) => {
        this.vipPrograms = [...data];
      },
    });
  }
}
