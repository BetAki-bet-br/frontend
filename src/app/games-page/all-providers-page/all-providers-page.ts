import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameEnum } from '@app/@shared/enums/gameEnum';
import { ProvidersList } from '../components/providers-list/providers-list';
import { Provider } from '../models/game.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-all-providers-page',
  imports: [ProvidersList],
  templateUrl: './all-providers-page.html',
  styleUrl: './all-providers-page.scss',
})
export class AllProvidersPage {
  private route = inject(ActivatedRoute);

  levelId = (this.route.snapshot.data['levelId'] as number) ?? GameEnum.CASINO;

  providers = toSignal(this.route.data.pipe(map((data) => (data['providers'] as Provider[]) ?? [])));
}
