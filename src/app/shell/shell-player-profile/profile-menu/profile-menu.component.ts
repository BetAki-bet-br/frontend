import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { MessageService } from '@app/@shared/services/message.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { SidenavMenuService } from '@app/shell/sidenav-menu/sidenav-menu.service';
import { Subscription } from 'rxjs';

const log = new Logger('ProfileMenuComponent');

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent implements OnInit, OnDestroy {
  @Output() linkClicked = new EventEmitter<void>();

  displayNumberOfMessages = false;

  private subscriptions: Subscription[] = [];

  constructor(
    public playerProfileService: PlayerProfileService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private sidenavService: SidenavMenuService
  ) {}

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
