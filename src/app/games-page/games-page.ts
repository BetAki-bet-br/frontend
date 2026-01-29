import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselComponent, CarouselSlide } from './components/carousel/carousel';
import { SidebarDesktop } from './components/sidebar-desktop/sidebar-desktop';
import { GhostColorLayer } from './components/ghost-color-layer/ghost-color-layer';
import { RoutingService } from '@app/@shared/services/routing.service';

@Component({
  selector: 'app-games-page',
  imports: [CarouselComponent, RouterOutlet, SidebarDesktop, GhostColorLayer],
  templateUrl: './games-page.html',
  styleUrl: './games-page.scss',
})
export class GamesPage {
  routingService = inject(RoutingService);

  banners: CarouselSlide[] = [
    {
      href: '',
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
}
