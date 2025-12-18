import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrentBannersData } from '@app/@core';
import { swiperBreakpointsLarge, swiperBreakpointsSmall } from '@app/@shared/app-breakpoints';
import { Logger } from '@app/@shared/logger.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import Swiper, { SwiperOptions } from 'swiper';

const log = new Logger('MainBanner');

@UntilDestroy()
@Component({
  selector: 'app-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainBannerComponent {
  // START: For banner placeholder
  @Input() bannerData: CurrentBannersData | null = {
    currentBannersLarge: [
      { template: '', content: {} },
      { template: '', content: {} },
    ],
    currentBannersSmall: [
      { template: '', content: {} },
      { template: '', content: {} },
    ],
  };
  // END: For banner placeholder
  @Input() showArrowsMobile = true;
  bannerDataSub?: Subscription;

  configLarge: SwiperOptions = {
    spaceBetween: 12,
    navigation: {
      nextEl: '.swiper-nav-container-right',
      prevEl: '.swiper-nav-container-left',
      enabled: false,
    },
    scrollbar: { draggable: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesOffsetAfter: 8,
    breakpoints: {
      [swiperBreakpointsSmall.Zero]: {
        slidesPerView: 1.5,
      },
      [swiperBreakpointsLarge.Zero]: {
        slidesPerView: 1.8,
      },
      [swiperBreakpointsLarge.XSmall]: {
        slidesPerView: 2.1,
      },
      [swiperBreakpointsLarge.Small]: {
        slidesPerView: 2.4,
      },
      [swiperBreakpointsLarge.Medium]: {
        slidesPerView: 2.6,
      },
      [swiperBreakpointsLarge.Large]: {
        slidesPerView: 3,
      },
    },
  };

  configSmall: SwiperOptions = {
    spaceBetween: 12,
    navigation: {
      nextEl: '.swiper-nav-container-right-mobile',
      prevEl: '.swiper-nav-container-left-mobile',
      enabled: false,
    },
    scrollbar: { draggable: true },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: 1.5,
    slidesOffsetAfter: 8,
  };

  // Show or hide navigation on mobile
  showNextNavigation = false;
  showPrevNavigation = false;

  get bannersSmall() {
    return this.bannerData?.currentBannersSmall;
  }

  get bannersLarge() {
    return this.bannerData?.currentBannersLarge;
  }

  onSwiper(swiper: Swiper) {
    log.info(swiper);
  }

  onSlideChange(swiper: Swiper[]) {
    if (swiper.length === 0) {
      return;
    }

    this.showPrevNavigation = !swiper[0]?.isBeginning;
    this.showNextNavigation = !swiper[0]?.isEnd;
  }
}
