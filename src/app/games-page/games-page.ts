import { afterNextRender, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselComponent, CarouselSlide } from './components/carousel/carousel';
import { SidebarDesktop } from './components/sidebar-desktop/sidebar-desktop';
import { GhostColorLayer } from './components/ghost-color-layer/ghost-color-layer';
import { RoutingService } from '@app/@shared/services/routing.service';
import { BannersService } from '@app/@core/backoffice';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-games-page',
  imports: [CarouselComponent, RouterOutlet, SidebarDesktop, GhostColorLayer],
  templateUrl: './games-page.html',
  styleUrl: './games-page.scss',
})
export class GamesPage {
  routingService = inject(RoutingService);
  // bannerService = inject(BannersService);
  computedBanners = computed(() => (this.routingService.isLiveCasino() ? this.liveBanners : this.cassinoBanners));

  // tigreSortudoBanner = toSignal(this.bannerService.getBanner(1), {
  //   initialValue: null,
  // });

  // constructor() {
  //   afterNextRender(() => {
  //     console.log('Tigre Sortudo Banner:', this.tigreSortudoBanner());
  //   });
  // }

  cassinoBanners: CarouselSlide[] = [
    {
      href: '',
      imageUrl: '/assets/carousel/tigre_janeiro.jpeg',
      alt: 'Tigre Sortudo 30 giros grátis',
    },
    {
      href: '/profile/promo',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CARAMELO SORTUDO_01.jpg',
      alt: 'Caramelo Sortudo',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CASHBACK_01.jpg',
      alt: 'Cashback 01',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CASHBACK_02.jpg',
      alt: 'Cashback 02',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_FORTUNE YURI_01.jpg',
      alt: 'Fortune Yuri',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_SILVIA ABRAVANEL_01.jpg',
      alt: 'Silvia Abravanel',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_YO DRAGON_01.jpg',
      alt: 'Yo Dragon',
    },
  ];

  liveBanners: CarouselSlide[] = [
    {
      href: '',
      imageUrl: '/assets/carousel/banner-live-cassino-1.jpeg',
      alt: 'Banner ao vivo 1',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/banner-live-cassino-2.jpeg',
      alt: 'Banner ao vivo 2',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/banner-live-cassino-3.jpeg',
      alt: 'Banner ao vivo 3',
    },
    {
      href: '',
      imageUrl: '/assets/carousel/banner-live-cassino-4.jpeg',
      alt: 'Banner ao vivo 4',
    },
  ];
}
