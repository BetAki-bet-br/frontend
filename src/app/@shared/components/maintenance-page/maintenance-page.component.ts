import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
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
  private readonly brand = inject(BRAND);

  protected readonly brandLogo = this.brand.assets.logo;
  instagramUrl: string = '';

  ngOnInit(): void {
    this.instagramUrl = this.brand.social.instagram ?? '';
  }
}
