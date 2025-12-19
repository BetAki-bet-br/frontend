import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Banner } from '@app/@shared/models';
import { CategoryKeyEnum } from '@app/@shared/models/template.model';
import { CmsService } from '@app/@shared/services/cms.service';
// Added CommonModule
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { RouterModule } from '@angular/router'; // Added RouterModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { CdnizePipe } from '@app/@pipes/cdnize.pipe'; // Added CdnizePipe

@Component({
  selector: 'app-register-page-init',
  templateUrl: './register-page-init.component.html',
  styleUrls: ['./register-page-init.component.scss'],
  imports: [TranslateModule, RouterModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageInitComponent implements OnInit {
  private cmsService = inject(CmsService);
  private cdr = inject(ChangeDetectorRef);

  @Output() registerClick = new EventEmitter<void>();

  bannerItem: Banner | null = null;

  ngOnInit(): void {
    this.loadBanner();
  }

  private loadBanner() {
    this.cmsService.getBannersBySlug(CategoryKeyEnum.RegisterPage).subscribe((res) => {
      this.bannerItem = res;
      this.cdr.markForCheck();
    });
  }
}
