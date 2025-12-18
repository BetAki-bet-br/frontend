import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { GameLauncherService } from '../game-launcher.service';
import { GameScreen } from '../game-screen.model';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-game-launch',
  templateUrl: './game-launch.component.html',
  styleUrls: ['./game-launch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameLaunchComponent implements OnInit, OnChanges, OnDestroy {
  sanitizer = inject(DomSanitizer);
  gameLauncherService = inject(GameLauncherService);
  private router = inject(Router);

  @Input() gameScreen: GameScreen | undefined;
  @Input() isLive = false;
  public multiScreen: boolean = false;
  public gameUrl: SafeResourceUrl | undefined;
  private currentlyActive: Subscription = new Subscription();

  ngOnInit() {
    this.currentlyActive = this.gameLauncherService.currentlyActive$.subscribe((value) => {
      this.multiScreen = value > 1 ? true : false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gameScreen']) {
      this.gameUrl = this.getUrlSafe(this.gameScreen?.game?.launchUrl);
    }
  }

  ngOnDestroy(): void {
    this.currentlyActive.unsubscribe();
  }

  getUrlSafe(url: string | undefined) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url ?? '');
  }

  isMultiscreen() {
    return this.gameLauncherService.getcurrentlyActive() > 1;
  }

  goBack() {
    if (!this.isLive) {
      this.router.navigateByUrl('/games/lobby');
    } else {
      this.router.navigateByUrl('/games-live/lobby');
    }
  }

  closeGame() {
    if (this.gameScreen) {
      this.gameLauncherService.setClosedGames([this.gameScreen.position]);
    }
  }
}
