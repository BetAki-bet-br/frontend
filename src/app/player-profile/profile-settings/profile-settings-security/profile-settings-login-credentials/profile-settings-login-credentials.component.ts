import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import {
  Breadcrumbs,
  PageBreadcrumbsComponent,
} from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-profile-settings-login-credentials',
  templateUrl: './profile-settings-login-credentials.component.html',
  styleUrls: ['./profile-settings-login-credentials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, MatIconModule, MatButtonModule, MatDividerModule, PageBreadcrumbsComponent],
})
export class ProfileSettingsLoginCredentialsComponent implements OnInit {
  private translateService = inject(TranslateService);
  private configurationService = inject(ConfigurationService);

  breadcrumbs: Breadcrumbs[] = [
    {
      svgIcon: 'essentials-home',
      url: '/',
    },
    {
      text: 'My account',
      url: '/profile',
    },
    {
      text: 'Login and security',
      url: '/profile/general/security',
    },
    {
      text: 'Login credentials',
    },
  ];

  playerEmail = '';

  ngOnInit(): void {
    this.loadData();
  }

  private loadData() {
    this.configurationService.getPlayerInfo(true).subscribe({
      next: (player) => {
        this.playerEmail = player?.eMail ?? '';
      },
    });
  }
}
