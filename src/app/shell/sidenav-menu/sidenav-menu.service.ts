import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavMenuService {
  private openMenu = new Subject<void>();

  openMenu$ = this.openMenu.asObservable();

  onOpenSideMenu() {
    this.openMenu.next();
  }
}
