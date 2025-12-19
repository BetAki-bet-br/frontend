import { AsyncPipe, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { MessageService } from '@app/@shared/services/message.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { SidenavMenuService } from '@app/shell/sidenav-menu/sidenav-menu.service';
import { Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface Breadcrumbs {
  icon?: string;
  svgIcon?: string;
  text?: string;
  url?: string;
  divider?: boolean;
  last?: boolean;
}

@Component({
  selector: 'app-page-breadcrumbs',
  templateUrl: './page-breadcrumbs.component.html',
  styleUrls: ['./page-breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AsyncPipe, TranslateModule, RouterLink],
})
export class PageBreadcrumbsComponent implements OnInit, OnChanges, OnDestroy {
  private dataStoreService = inject(DataStoreService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private tawkToScriptService = inject(TawkToScriptService);
  private sidenavService = inject(SidenavMenuService);
  private router = inject(Router);
  private location = inject(Location);

  @Input() breadcrumbs: Breadcrumbs[] = [];
  @Input() showTopBar: boolean = true;
  @Output() backButtonClicked = new EventEmitter<void>();

  breadcrumbsList: Breadcrumbs[] = [];

  isLoggedIn: boolean = false;

  messageCount$ = this.messageService.unreadCount$;

  displayNumberOfMessages = false;

  private subscriptions: Subscription[] = [];

  get lastBreadcrumbText(): string | undefined {
    return this.breadcrumbsList.find((b) => b.last)?.text;
  }

  ngOnInit(): void {
    this.isLoggedIn = !!this.dataStoreService.credentials;

    this.subscriptions.push(
      this.messageCount$.subscribe((count) => {
        this.displayNumberOfMessages = (count ?? 0) > 0;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['breadcrumbs']) {
      this.breadcrumbsList = [];

      for (let i = 0; i < this.breadcrumbs.length; i++) {
        if (i === this.breadcrumbs.length - 1) {
          this.breadcrumbs[i].last = true;
        }

        this.breadcrumbsList.push(this.breadcrumbs[i]);

        if (i < this.breadcrumbs.length - 1) {
          this.breadcrumbsList.push({
            icon: 'chevron_right',
            divider: true,
          });
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onSupportClick() {
    this.tawkToScriptService.maximize();
  }

  onOpenPlayerMenu() {
    this.sidenavService.onOpenSideMenu();
  }

  isOnGeneralProfilePage(): boolean {
    return this.router.url === '/profile/general';
  }

  isOnProfilePage(): boolean {
    return this.router.url.startsWith('/profile');
  }

  onBack() {
    const lastNavigableBreadcrumb = this.breadcrumbsList
      .slice()
      .reverse()
      .find((breadcrumb) => !!breadcrumb.url);

    this.backButtonClicked.emit();
    if (this.isOnProfilePage()) {
      // Navigate to the previous page in the breadcrumbs array. If there are none, navigate to the general profile page
      this.router.navigate(lastNavigableBreadcrumb ? [lastNavigableBreadcrumb.url] : ['/profile/general']);
    } else {
      // Navigate to the previous page in the breadcrumbs array. If there are none, navigate to homepage
      this.router.navigate(lastNavigableBreadcrumb ? [lastNavigableBreadcrumb.url] : ['/']);
    }
  }
}
