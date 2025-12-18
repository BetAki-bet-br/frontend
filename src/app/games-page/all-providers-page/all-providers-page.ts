import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { PortalService } from '@app/@shared/services/portal.service';
import { ProvidersService } from '@app/@shared/services/providers.service';
import { ProvidersList } from '../components/providers-list/providers-list';
import { Provider } from '../models/game.models';

@Component({
  selector: 'app-all-providers-page',
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
