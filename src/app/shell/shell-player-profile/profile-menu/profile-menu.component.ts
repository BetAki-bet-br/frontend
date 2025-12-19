import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Logger } from '@app/@shared/logger.service';
import { MessageService } from '@app/@shared/services/message.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { SidenavMenuService } from '@app/shell/sidenav-menu/sidenav-menu.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';

const log = new Logger('ProfileMenuComponent');

@Component({
  selector: 'app-profile-menu',
  imports: [TranslateModule, RouterLinkActive, MatIconModule, AsyncPipe, RouterLink],
  templateUrl: './profile-menu.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent implements OnInit, OnDestroy {
  playerProfileService = inject(PlayerProfileService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  private sidenavService = inject(SidenavMenuService);

  @Output() linkClicked = new EventEmitter<void>();

  displayNumberOfMessages = false;

  private subscriptions: Subscription[] = [];

  expanded = false;
  messageCount$ = this.messageService.unreadCount$;

  ngOnInit(): void {
    this.subscriptions.push(
      this.messageCount$.subscribe((count) => {
        this.displayNumberOfMessages = (count ?? 0) > 0;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  toggleMenu() {
    this.expanded = !this.expanded;
  }

  onLinkClick() {
    this.sidenavService.onOpenSideMenu();
  }
}
