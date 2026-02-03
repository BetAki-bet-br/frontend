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
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/tigre_janeiro.jpeg',
      alt: 'Tigre Sortudo 30 giros grátis',
      duration: 5000,
    },
    {
      href: 'https://betaki.bet.br/game/ALE-19922',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CARAMELO SORTUDO_01.jpg',
      alt: 'Caramelo Sortudo',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CASHBACK_01.jpg',
      alt: 'Cashback 01',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_CASHBACK_02.jpg',
      alt: 'Cashback 02',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/game/ALE-24812',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_FORTUNE YURI_01.jpg',
      alt: 'Fortune Yuri',
      duration: 5000,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_SILVIA ABRAVANEL_01.jpg',
      alt: 'Silvia Abravanel',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/game/ALE-18493',
      imageUrl: '/assets/carousel/2026_JAN_BANNER_YO DRAGON_01.jpg',
      alt: 'Yo Dragon',
      duration: 3500,
    },
  ];

  liveBanners: CarouselSlide[] = [
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/banner-live-cassino-1.jpeg',
      alt: 'Banner ao vivo 1',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/banner-live-cassino-2.jpeg',
      alt: 'Banner ao vivo 2',
      duration: 3500,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/banner-live-cassino-3.jpeg',
      alt: 'Banner ao vivo 3',
      duration: 5000,
    },
    {
      href: 'https://betaki.bet.br/profile/promo',
      imageUrl: '/assets/carousel/banner-live-cassino-4.jpeg',
      alt: 'Banner ao vivo 4',
      duration: 3500,
    },
  ];
}
