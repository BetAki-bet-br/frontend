import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AppBreakpoints } from '@shared';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { SidebarMobile } from '../sidebar-mobile/sidebar-mobile';

@Component({
  selector: 'app-profile-layout',
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProfileMenuComponent, SidenavMenuComponent, RouterOutlet],
})
export class ProfileLayoutComponent implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private breakpointObserver = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  @ViewChild(SidenavMenuComponent, { static: false }) sidenavMenu!: SidenavMenuComponent;

  isSmallScreen = false;

  ngOnInit(): void {
    this.breakpointObserver
      .observe(AppBreakpoints.LtSmall2)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.matches) {
          this.isSmallScreen = true;
          this.cdr.markForCheck();
        } else {
          this.isSmallScreen = false;
          this.cdr.markForCheck();
        }
      });
  }

  isActive(url: string) {
    return this.router.url?.endsWith(url);
  }
}
