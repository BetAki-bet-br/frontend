import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  DOCUMENT,
  inject,
} from '@angular/core';
import { GameLauncherService } from '@app/game-launcher/game-launcher.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameControlsComponent implements OnInit, OnDestroy {
  gameLauncherService = inject(GameLauncherService);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @Input() isLive = false;

  elem: any;
  isFullScreen: boolean | undefined;
  private currentlyActive: Subscription = new Subscription();
  public activeControl: number = 1;

  ngOnInit(): void {
    this.checkScreenMode();
    this.elem = document.documentElement;

    this.currentlyActive = this.gameLauncherService.currentlyActive$.subscribe((value) => {
      this.activeControl = value;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.currentlyActive.unsubscribe();
  }

  changeGameScreen(screenType: Number) {
    switch (screenType) {
      case 1:
        this.gameLauncherService.setGameScreen(1);
        break;
      case 2:
        this.gameLauncherService.setGameScreen(2);
        break;
      case 4:
        this.gameLauncherService.setGameScreen(4);
        break;
      default:
        break;
    }
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  fullscreenmodes() {
    this.checkScreenMode();
  }
  checkScreenMode() {
    this.isFullScreen = !!document.fullscreenElement;
  }
  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    }
    // else if (this.document.mozCancelFullScreen) {
    //   /* Firefox */
    //   this.document.mozCancelFullScreen();
    // } else if (this.document.webkitExitFullscreen) {
    //   /* Chrome, Safari and Opera */
    //   this.document.webkitExitFullscreen();
    // } else if (this.document.msExitFullscreen) {
    //   /* IE/Edge */
    //   this.document.msExitFullscreen();
    // }
  }

  exitGameLauncher() {
    if (!this.isLive) {
      this.router.navigateByUrl('/games/lobby');
    } else {
      this.router.navigateByUrl('/games-live/lobby');
    }
  }
}
