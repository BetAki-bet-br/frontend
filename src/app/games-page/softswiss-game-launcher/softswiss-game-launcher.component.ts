// src/app/games-page/softswiss-game-launcher/softswiss-game-launcher.component.ts
import { Component, Input, OnInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const GameLauncher: any; // Declare GameLauncher to avoid TypeScript errors

@Component({
  selector: 'app-softswiss-game-launcher',
  standalone: true,
  template: `
    <div [id]="gameContainerId"></div>
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
      div[id] {
        width: 100%;
        height: 100%;
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
  @Input() launchData: any; // The raw server response from gameService.launchGame
  gameContainerId = 'softswiss_game_wrapper';
  gameLaunched = false;
  private scriptElement: HTMLScriptElement | null = null;
  private readonly SCRIPT_URL = 'https://s3.eu-central-1.amazonaws.com/ignition.button/round-1/connector.js';
  private readonly elementRef = inject(ElementRef);

  ngOnInit(): void {
    if (this.launchData) {
      this.loadSoftswissScript().then(() => {
        this.initializeGameLauncher();
      });
    }
  }

  ngOnDestroy(): void {
    this.removeSoftswissScript();
  }

  private loadSoftswissScript(): Promise<void> {
    return new Promise((resolve) => {
      if (document.getElementById('softswiss-connector-script')) {
        resolve();
        return;
      }

      this.scriptElement = document.createElement('script');
      this.scriptElement.id = 'softswiss-connector-script';
      this.scriptElement.src = this.SCRIPT_URL;
      this.scriptElement.defer = true;
      this.scriptElement.onload = () => resolve();
      this.scriptElement.onerror = (error) => {
        console.error('Failed to load Softswiss connector script:', error);
        resolve(); // Resolve even on error to avoid hanging, but log it
      };
      document.head.appendChild(this.scriptElement);
    });
  }

  private removeSoftswissScript(): void {
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
      this.scriptElement = null;
    }
  }

  private initializeGameLauncher(): void {
    // Ensure the div is in the DOM before initializing
    // The component's template already includes the div.
    // We need to wait for the DOM to be ready and the script to be loaded.
    const interval = setInterval(() => {
      if (typeof GameLauncher !== 'undefined') {
        clearInterval(interval);
        try {
          // It's important to run this on DOMContentLoaded if the script expects it,
          // but since we're loading the script dynamically and waiting for it,
          // we can call it directly. The GameLauncher itself might add event listeners.
          const launcher = new GameLauncher(this.gameContainerId);
          launcher.run(this.launchData);
          this.gameLaunched = true;
        } catch (e) {
          console.error('Error initializing GameLauncher:', e);
          // Handle error, e.g., show an error message to the user
        }
      } else {
        console.log('Waiting for GameLauncher to be defined...');
      }
    }, 100); // Check every 100ms for GameLauncher
    setTimeout(() => {
      if (!this.gameLaunched) {
        clearInterval(interval);
        console.error('GameLauncher was not defined within the timeout period.');
        // Show an error message if the script fails to load/initialize
        this.gameLaunched = true; // Hide loading overlay
      }
    }, 10000); // Timeout after 10 seconds
  }
}
