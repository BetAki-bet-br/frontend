import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Breadcrumbs } from '@app/@shared/components/page-breadcrumbs/page-breadcrumbs.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-settings-login-credentials',
  templateUrl: './profile-settings-login-credentials.component.html',
  styleUrls: ['./profile-settings-login-credentials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsLoginCredentialsComponent implements OnInit {
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

  constructor(private translateService: TranslateService, private configurationService: ConfigurationService) {}

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
