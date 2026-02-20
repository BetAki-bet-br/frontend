import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarouselComponent, CarouselSlide } from './components/carousel/carousel';
import { SidebarDesktop } from './components/sidebar-desktop/sidebar-desktop';
import { RoutingService } from '@app/@shared/services/routing.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SlidesService } from '@app/@core/backoffice/slides.service';

@Component({
  selector: 'app-games-page',
  imports: [CarouselComponent, RouterOutlet, SidebarDesktop],
  templateUrl: './games-page.html',
  styleUrl: './games-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesPage {
  routingService = inject(RoutingService);
  slidesService = inject(SlidesService);
  cassinoBanners = toSignal(this.slidesService.getSlides('slots'), {
    initialValue: [],
  });

  liveBanners = toSignal(this.slidesService.getSlides('live'), {
    initialValue: [],
  });

  computedBanners = computed(() => {
    const isLive = this.routingService.isLiveCasino();
    const live = this.liveBanners();
    const cassino = this.cassinoBanners();

    if (isLive) {
      return live.length > 0 ? live : cassino.length > 0 ? cassino : [];
    } else {
      return cassino.length > 0 ? cassino : live.length > 0 ? live : [];
    }
  });
}
