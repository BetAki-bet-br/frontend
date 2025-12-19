import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { TwentyFourDateFormat } from '@app/@core/date-formats';

export interface FooterMySummaryData {
  lastOnline: string;
  currentSessionTime: string;
  wonAmount: string;
  lostAmount: string;
  balance: string;
}

@Component({
  selector: 'app-footer-my-summary',
  templateUrl: './footer-my-summary.component.html',
  styleUrls: ['./footer-my-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
})
export class FooterMySummaryComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  @Input() mySummaryData: FooterMySummaryData | undefined;
  dateFormat = TwentyFourDateFormat;
  sessionTime: string = '';
  private sessionInterval: any;

  ngOnInit(): void {
    this.updateSessionTime();
    this.sessionInterval = setInterval(() => {
      this.updateSessionTime();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
    }
  }

  updateSessionTime() {
    let diff = Math.floor(new Date().getTime() - new Date(this.mySummaryData?.currentSessionTime ?? '').getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * 1000 * 60;
    const seconds = Math.floor(diff / 1000);
    const pad = (num: number) => String(num).padStart(2, '0');
    this.sessionTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    this.cdr.markForCheck();
  }
}
