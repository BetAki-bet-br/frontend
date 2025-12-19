import { Component, effect, inject, signal } from '@angular/core';
import { ProvidersService } from '@/app/core/services/providers.service';
import { Provider } from '@/app/core/models/game.models';
import { PortalService } from '@/app/core/services/portal.service';
import { GameEnum } from '@/app/enums/gameEnum';
import { ActivatedRoute } from '@angular/router';
import { ProvidersList } from '@/app/shared/providers-list/providers-list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-providers-page',
  standalone: true,
  imports: [CommonModule, ProvidersList],
  templateUrl: './all-providers-page.html',
  styleUrl: './all-providers-page.scss',
})
export class AllProvidersPage {
  private route = inject(ActivatedRoute);
  private providersService = inject(ProvidersService);
  private portalService = inject(PortalService);

  levelId = (this.route.snapshot.data['levelId'] as number) ?? GameEnum.CASINO;
  portalId = this.portalService.portalId;

  providers = signal<Provider[]>([]);

  constructor() {
    effect(() => {
      this.providersService.getProviders(this.levelId, this.portalId).subscribe((list) => {
        this.providers.set(list);
      });
    });
  }
}
