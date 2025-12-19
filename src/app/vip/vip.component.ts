import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { VipService } from './vip.service';
import { VipProgram } from '@app/@shared/models';

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  styleUrls: ['./vip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VipComponent implements OnInit {
  vipPrograms: VipProgram[] = [];

  readMoreHidden = true;

  constructor(private vipService: VipService) {}

  ngOnInit() {
    this.vipService.getAllVipPrograms().subscribe({
      next: (data) => {
        this.vipPrograms = [...data];
      },
    });
  }
}
