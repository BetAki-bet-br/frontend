import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';

const log = new Logger('DepositDialogComponent');

@Component({
  selector: 'app-deposit-dialog',
  templateUrl: './deposit-dialog.component.html',
  styleUrls: ['./deposit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositDialogComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
