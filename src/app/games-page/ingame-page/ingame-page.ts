import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { IngamePageData } from './ingame-page.resolver';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Slot } from '@app/@core/backoffice';
import { SoftswissGameLauncherComponent } from '../softswiss-game-launcher/softswiss-game-launcher.component';

/** What the page shows before `ingamePageResolver` has produced anything. */
const NO_GAME: IngamePageData = { game: undefined, gameUrl: null, isSoftswissGame: false, softswissLaunchData: null };

@Component({
  selector: 'app-ingame-page',
  imports: [SoftswissGameLauncherComponent],
  templateUrl: './ingame-page.html',
  styleUrl: './ingame-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngamePage {
  private readonly route = inject(ActivatedRoute);

  private readonly data: Signal<IngamePageData> = toSignal(
    this.route.data.pipe(map((d) => (d['data'] as IngamePageData | undefined) ?? NO_GAME)),
    { initialValue: NO_GAME },
  );

  readonly game: Signal<Slot | undefined> = computed(() => this.data().game);
  readonly gameUrl: Signal<SafeResourceUrl | null> = computed(() => this.data().gameUrl);
  readonly launchError: Signal<string | undefined> = computed(() => this.data().error);
  readonly isSoftswissGame: Signal<boolean> = computed(() => this.data().isSoftswissGame ?? false);
  readonly softswissLaunchData: Signal<any> = computed(() => this.data().softswissLaunchData);
}
