import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Banner } from '@app/@shared/models';
import { CategoryKeyEnum } from '@app/@shared/models/template.model';
import { CmsService } from '@app/@shared/services/cms.service';

@Component({
  selector: 'app-register-page-init',
  templateUrl: './register-page-init.component.html',
  styleUrls: ['./register-page-init.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageInitComponent implements OnInit {
  @Output() registerClick = new EventEmitter<void>();

  bannerItem: Banner | null = null;

  constructor(private cmsService: CmsService, private cdr: ChangeDetectorRef) {}

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
