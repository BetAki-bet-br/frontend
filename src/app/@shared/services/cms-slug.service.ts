import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { CategoryKeyEnum } from '../models/template.model';

@Injectable({
  providedIn: 'root',
})
export class CmsSlugService {
  private readonly brand = inject(BRAND);

  getCmsSlug(categoryKey: CategoryKeyEnum): string {
    return this.brand.ids.cmsSlugPostfix ? `${categoryKey}-${this.brand.ids.cmsSlugPostfix}` : categoryKey;
  }
}
