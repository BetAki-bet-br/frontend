import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CurrentBannersData } from '@app/@core';
import { swiperBreakpointsLarge, swiperBreakpointsSmall } from '@app/@shared/app-breakpoints';
import { Logger } from '@app/@shared/logger.service';
import { Subscription } from 'rxjs';
import { Swiper, SwiperOptions } from 'swiper/types';
import { SwiperContainer } from 'swiper/element';
// Added CommonModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
// Register Swiper custom elements
import { register } from 'swiper/element/bundle';
register();

const log = new Logger('MainBanner');

@Component({
  selector: 'app-main-banner',
  templateUrl: './main-banner.component.html',
  styleUrls: ['./main-banner.component.scss'],
  imports: [MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Allow custom elements like swiper-container and swiper-slide
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainBannerComponent implements AfterViewInit, OnChanges {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef<SwiperContainer>;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bannerData'] && !changes['bannerData'].firstChange) {
      this.initializeSwiper();
    }
  }

  ngAfterViewInit(): void {
    this.initializeSwiper();
  }

  initializeSwiper() {
    if (this.swiperContainer) {
      const swiperEl = this.swiperContainer.nativeElement;
      const swiperParams =
        (this.bannerData?.currentBannersLarge?.length ?? 0) > 1 ? this.configLarge : this.configSmall;

      Object.assign(swiperEl, swiperParams);

      swiperEl.initialize();
    }
  }

  onSlideChange(e: CustomEvent<[Swiper]>) {
    const swiper = e.detail[0];
    if (!swiper) {
      return;
    }

    this.showPrevNavigation = !swiper.isBeginning;
    this.showNextNavigation = !swiper.isEnd;
  }
}
