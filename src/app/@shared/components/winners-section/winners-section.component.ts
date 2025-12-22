import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { WinnersItem } from '@app/@shared/models';
import { Subscription, distinctUntilChanged } from 'rxjs';
import { WinnersService } from './winners.service';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { CasinoWinsComponent } from './casino-wins/casino-wins.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-winners-section',
  templateUrl: './winners-section.component.html',
  styleUrls: ['./winners-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CasinoWinsComponent, TranslateModule],
})
export class WinnersSectionComponent implements OnInit, OnDestroy {
  private winnersService = inject(WinnersService);
  private breakpointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);

  @Input() hideLatestWinners = false;
  @Input() hidePoolJackpot = false;
  @Input() hideTopWinners = false;
  @Input() withBackground = false;

  latestWinners$ = this.winnersService.getLatestWinners();
  emptyWinners$ = this.winnersService.emptyWinners$;
  poolJackpot$: WinnersItem[] = [];

  nrOfDisplayedItems = 7;

  private subscriptions = new Subscription();

  ngOnInit(): void {
    // if (!this.hidePoolJackpot) {
    //   this.winnersService.getPoolJackpot().subscribe((poolJackpot) => {
    //     this.poolJackpot = poolJackpot;
    //   });
    // }

    // Subscribe to window width changes. Used to change number of items displayed.
    this.subscriptions.add(
      this.breakpointObserver
        .observe([AppBreakpoints.LtSmall2, AppBreakpoints.LtMedium])
        .pipe(distinctUntilChanged())
        .subscribe((change) => {
          this.nrOfDisplayedItems = change.breakpoints[AppBreakpoints.LtSmall2]
            ? 3
            : change.breakpoints[AppBreakpoints.LtMedium]
              ? 5
              : 7;
          this.cdr.markForCheck();
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
