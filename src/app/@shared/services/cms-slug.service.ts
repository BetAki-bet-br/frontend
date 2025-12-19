import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CategoryKeyEnum } from '../models/template.model';

@Injectable({
  providedIn: 'root',
})
export class CmsSlugService {
  constructor() {}

  getCmsSlug(categoryKey: CategoryKeyEnum): string {
    return environment.deployConfig.cmsSlugPostfix
      ? `${categoryKey}-${environment.deployConfig.cmsSlugPostfix}`
      : categoryKey;
  }
}
