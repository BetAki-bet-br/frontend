import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { Banner } from '@app/@shared/models';
import { CmsService } from '@app/@shared/services/cms.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-banner-promotions',
  templateUrl: './banner-promotions.component.html',
  styleUrls: ['./banner-promotions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageBreadcrumbsComponent],
})
export class BannerPromotionsComponent implements OnInit {
  private cmsService = inject(CmsService);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  bannerPromotions$ = this.cmsService.getBannersForPromotions();
  bannerPromotions: Banner[] | undefined;
  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: this.translate.instant('Promotions and bonuses'),
    },
  ];

  ngOnInit(): void {
    this.bannerPromotions$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.bannerPromotions = res.currentBannersLarge;

      this.cdr.markForCheck();
    });
  }
}
