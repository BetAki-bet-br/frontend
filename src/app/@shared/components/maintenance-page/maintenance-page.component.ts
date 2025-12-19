import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { MatIcon } from '@angular/material/icon';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, CdnizePipe],
})
export class MaintenancePageComponent implements OnInit {
  instagramUrl: string = '';

  ngOnInit(): void {
    this.instagramUrl = environment.deployConfig.socialInstagramUrl;
  }
}
