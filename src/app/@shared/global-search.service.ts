import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchService {
  globalSearchEnabled = false;

  constructor() {}

  enableGlobalSearch() {
    this.globalSearchEnabled = true;
  }

  disableGlobalSearch() {
    this.globalSearchEnabled = false;
  }

  isEnabled() {
    return this.globalSearchEnabled;
  }
}
