import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { AssetsService } from '@app/@shared/assets.service';
import { GameTile } from '@app/@shared/models/game.model';
import { GameStateService } from '@app/@shared/services/game-state.service';
import { EMBEDDED_IMAGES } from '@app/@shared/utils/embedded-images';
import { CredentialsService } from '@app/auth';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { environment } from '@env/environment';

export interface GameCardGameSelectedEvent {
  game: GameTile;
  type: 'real' | 'demo';
}

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss'],
  imports: [CommonModule, MatIconModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCardComponent {
  assetsService = inject(AssetsService);
  credentialsService = inject(CredentialsService);
  private router = inject(Router);
  private authDialogService = inject(AuthDialogService);
  private dataStoreService = inject(DataStoreService);
  private route = inject(ActivatedRoute);
  private gameStateService = inject(GameStateService);

  @Input() public game: GameTile | null = null;
  @Input() public indexOfElement: number | null = null;
  @Input() public emitEvent = false;
  @Input() public hideDemoPlay = false;

  @Output() gameSelected = new EventEmitter<GameCardGameSelectedEvent>();

  hoverState = false;
  selectedGame: GameTile | null = null;
  missingImgUrl = this.assetsService.cdnizeUrl('assets/general/logo/game-placeholder.jpg');
  placeholderImgUrl = EMBEDDED_IMAGES.gameTilePlaceholder;
  demoPlayEnabled = environment.demoPlayEnabled;

  get isMobile() {
    return this.dataStoreService.isDeviceMobile();
  }

  enterHover(game: GameTile | null): void {
    this.hoverState = true;
    this.selectedGame = game;
  }

  exitHover(): void {
    this.hoverState = false;
    this.selectedGame = null;
  }

  onGameClick(type: 'real' | 'demo') {
    if (this.emitEvent) {
      this.gameSelected.emit({
        game: this.game!,
        type: type,
      });
    } else {
      if (!this.credentialsService.isAuthenticated() && type === 'real') {
        this.launchGameOnAuthenticated(type);
      } else {
        this.navigateToGame(type);
      }
    }
  }

  onMobileGameClick() {
    let type = 'real';
    // If user not authenticated open login form
    if (!this.credentialsService.isAuthenticated()) {
      this.launchGameOnAuthenticated(type);
    } else {
      this.navigateToGame(type);
    }
  }

  onImgError(event: any) {
    if (!event.target.alreadySet) {
      event.target.src = this.missingImgUrl;
      event.target.alreadySet = true;
    }
  }

  private launchGameOnAuthenticated(type: string) {
    this.router.navigate(['sign-in'], { queryParams: { redirectURL: '/game/' + this.game?.externalGameId } });
  }

  private navigateToGame(type: string) {
    this.router.navigate(
      ['/game', this.game!.externalGameId]
      // type === 'demo'
      //   ? {
      //       queryParams: { demoPlay: true },
      //     }
      //   : undefined
    );

    this.gameStateService.setIsLive(this.route.snapshot.data?.['isLive'] ?? false);
  }
}
