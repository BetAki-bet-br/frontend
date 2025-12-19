import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { Banner } from '@app/@shared/models';
import { CmsService } from '@app/@shared/services/cms.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-banner-promotions',
  templateUrl: './banner-promotions.component.html',
  styleUrls: ['./banner-promotions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerPromotionsComponent implements OnInit {
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

  constructor(private cmsService: CmsService, private cdr: ChangeDetectorRef, private translate: TranslateService) {}

  ngOnInit(): void {
    this.bannerPromotions$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.bannerPromotions = res.currentBannersLarge;

      this.cdr.markForCheck();
    });
  }
}
