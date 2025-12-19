import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenancePageComponent implements OnInit {
  instagramUrl: string = '';

  ngOnInit(): void {
    this.instagramUrl = environment.deployConfig.socialInstagramUrl;
  }
}
