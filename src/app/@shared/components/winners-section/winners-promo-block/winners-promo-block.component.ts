import { CurrencyPipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { AssetsService } from '@app/@shared/assets.service';
import { Logger } from '@app/@shared/logger.service';
import { WinnersItem } from '@app/@shared/models';
import { Observable, Subscription, isObservable } from 'rxjs';

export type WinnersType = 'win' | 'topWin' | 'jackpot';

const log = new Logger('WinnersPromoBlockComponent');

@Component({
  selector: 'app-winners-promo-block',
  templateUrl: './winners-promo-block.component.html',
  styleUrls: ['./winners-promo-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, CurrencyPipe, RouterLink, CdnizePipe],
})
export class WinnersPromoBlockComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private assetsService = inject(AssetsService);

  @Input() titleImageSrc?: string;
  @Input() headerLabel?: string;
  @Input() headerAmount?: string;
  @Input() dataSource?: Observable<WinnersItem[]> | null;
  @Input() enumerated = false;
  @Input() type: WinnersType = 'win';
  @Input() nrOfDisplayedItems = 7;

  items: WinnersItem[] = [];
  updatingEnabled = true;

  private subscriptions = new Subscription();
  private bufferedItems: WinnersItem[] = [];

  ngOnInit(): void {
    if (this.dataSource) {
      this.subscriptions.add(
        this.dataSource.subscribe((items) => {
          if (this.updatingEnabled) {
            if (!items.length) {
              return;
            }
            this.items.unshift(...items.reverse());
            this.items = this.items.slice(0, 7);
            this.cdr.markForCheck();
          } else {
            this.bufferedItems.push(...items);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Disable list updating.
  disableUpdating = () => {
    this.updatingEnabled = false;
  };

  // Enable updating of list items and insert buffered items.
  enableUpdating = () => {
    this.updatingEnabled = true;
    if (!this.bufferedItems.length || !isObservable(this.dataSource)) {
      return;
    }
    this.items.unshift(...this.bufferedItems.reverse());
    this.items = this.items.slice(0, 7);
    this.bufferedItems = [];
    this.cdr.markForCheck();
  };

  onImgError(event: any) {
    if (!event.target.alreadySet) {
      event.target.src = this.assetsService.cdnizeUrl('/assets/general/logo/betaki-logo.png');
      event.target.alreadySet = true;
    }
  }
}
