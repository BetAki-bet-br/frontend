import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';

declare const GameLauncher: any;

interface SoftSwissLaunchData {
  id: number;
  gameExternalId: string;
  launch_url: string; // SoftSwiss expects 'launch_url', not 'location'
  parameters?: any;
  webMethod?: string;
}
@Component({
  selector: 'app-softswiss-game-launcher',
  standalone: true,
  template: `
    <div [id]="gameContainerId" class="w-full h-full"></div>
    @if (!gameLaunched) {
      <div class="loading-overlay">
        <p>Carregando jogo...</p>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 1.5em;
      }
    `,
  ],
})
export class SoftswissGameLauncherComponent implements OnInit, OnDestroy {
  @Input() launchData: SoftSwissLaunchData | null = null;

  readonly gameContainerId = 'softswiss_game_wrapper';
  gameLaunched = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private pollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    console.log('Initializing SoftSwissGameLauncher with launchData:', this.launchData);
  }

  ngOnInit(): void {
    if (this.launchData) {
      console.log('Initializing SoftSwissGameLauncher with launchData:', this.launchData);
      this.initializeGameLauncher();
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.pollTimeout !== null) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
  }

  private initializeGameLauncher(): void {
    // connector.js is loaded globally in index.html; poll until GameLauncher is available
    this.pollInterval = setInterval(() => {
      if (typeof GameLauncher !== 'undefined') {
        this.clearTimers();

        console.log('GameLauncher is available. Initializing with launchData:', this.launchData);

        const serverResponse = {
          id: this.launchData?.id,
          gameExternalId: this.launchData?.gameExternalId,
          game_launcher_url: this.launchData?.launch_url,
          parameters: this.launchData?.parameters,
          webMethod: this.launchData?.webMethod,
        };

        console.log('GameLauncher is available. Server response:', serverResponse);

        try {
          const launcher = new GameLauncher(this.gameContainerId);
          // launcher.run expects the server response string (location field from PostGameResponse)
          // map location to launch_url as expected by SoftSwiss
          launcher.run(JSON.stringify(serverResponse));
          this.gameLaunched = true;
          this.cdr.markForCheck();
        } catch (e) {
          console.error('Error initializing GameLauncher:', e);
          this.gameLaunched = true;
          this.cdr.markForCheck();
        }
      }
    }, 100);

    // Timeout after 10 s to avoid infinite polling
    this.pollTimeout = setTimeout(() => {
      if (!this.gameLaunched) {
        this.clearTimers();
        console.error('GameLauncher was not available within the timeout period.');
        this.gameLaunched = true;
        this.cdr.markForCheck();
      }
    }, 10000);
  }
}
