import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselComponent, CarouselSlide } from './components/carousel/carousel';
import { SidebarDesktop } from './components/sidebar-desktop/sidebar-desktop';
import { GhostColorLayer } from './components/ghost-color-layer/ghost-color-layer';

@Component({
  selector: 'app-games-page',
  imports: [CarouselComponent, RouterOutlet, SidebarDesktop, GhostColorLayer],
  templateUrl: './games-page.html',
  styleUrl: './games-page.scss',
})
export class GamesPage {
  banners: CarouselSlide[] = [
    {
      href: '',
      imageUrl: '/assets/silvia.jpg',
      alt: 'Banner 7',
    },
    {
      href: '',
      imageUrl: '/assets/gustavo.jpg',
      alt: 'Banner 8',
    },
    {
      href: '',
      imageUrl: '/assets/liminha.jpg',
      alt: 'Banner 9',
    },
  ];

  winners = Array.from({ length: 6 });
}
