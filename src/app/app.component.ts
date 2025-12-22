import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TooltipComponent } from '@angular/material/tooltip';
import { AppIconsService } from './@shared/services/app-icons.service';
import { AppStartupService } from './@shared/services/app-startup.service';
import { Logger } from '@shared';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

const log = new Logger('App');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslateModule],
})
export class AppComponent implements OnInit, OnDestroy {
  private appStartupService = inject(AppStartupService);
  private appIconsService = inject(AppIconsService);

  constructor() {
    Object.defineProperty(TooltipComponent.prototype, 'message', {
      set(v: any) {
        const el = document.querySelectorAll('.mdc-tooltip__surface');
        if (el) {
          el[el.length - 1].innerHTML = v;
        }
      },
    });
  }

  ngOnInit() {
    log.debug('Initializating platform');
    this.appIconsService.init();
    this.appStartupService.init();
  }

  ngOnDestroy() {
    // Services handle their own cleanup if necessary
  }
}
