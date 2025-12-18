import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppBreakpoints } from '@app/@shared';
import { environment } from '@env/environment';
import { map, Subscription } from 'rxjs';

export interface CategoryCardData {
  description?: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImg?: string;
  backgroundMobileImg?: string;
}

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCardComponent implements OnInit, OnDestroy {
  @Input() cardData: CategoryCardData = {
    description: '',
    buttonText: '',
    buttonUrl: '',
    backgroundImg: 'assets/general/images/category-casino.png',
    backgroundMobileImg: 'assets/general/images/category-casino-mobile.png',
  };

  isMobile: boolean = false;
  //TODO [manjak] to mora biti rešeno drugače. To je fix za golive
  brandId = environment.deployConfig.brandId;

  private subscription = new Subscription();

  constructor(private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.breakpointObserver
        .observe(AppBreakpoints.LtSmall2)
        .pipe(
          map((change) => {
            this.isMobile = change.matches;
            this.cdr.markForCheck();
          })
        )
        .subscribe()
    );
  }
}
