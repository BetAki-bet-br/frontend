import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';

@Component({
  selector: 'app-auth-layout-page',
  imports: [RouterOutlet],
  templateUrl: './auth-layout-page.html',
  styleUrl: './auth-layout-page.scss',
})
export class AuthLayoutPage {
  private readonly tawkMessengerService = inject(TawkToScriptService);

  openSupportChat() {
    this.tawkMessengerService.maximize();
  }
}
