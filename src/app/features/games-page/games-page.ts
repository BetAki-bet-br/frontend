import { CarouselComponent, CarouselSlide } from '@/app/shared/carousel/carousel';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarDesktop } from '../../layout/sidebar-desktop/sidebar-desktop';

@Component({
  selector: 'app-games-page',
  imports: [CarouselComponent, RouterOutlet, SidebarDesktop],
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
