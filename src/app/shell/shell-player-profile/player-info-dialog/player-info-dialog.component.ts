import { DialogRef } from '@angular/cdk/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { AppBreakpoints, Logger, UntilDestroy, untilDestroyed } from '@app/@shared';
import { MessageDialogComponent } from '@app/@shared/components/message-dialog/message-dialog.component';
import { AccountResolved } from '@app/@shared/models';
import { PlayerStatusService } from '@app/@shared/services/player.service';
import { AuthenticationService } from '@app/auth';
import { finalize } from 'rxjs';

const log = new Logger('PlayerInfoDialogComponent');

@UntilDestroy()
@Component({
  selector: 'app-player-info-dialog',
  templateUrl: './player-info-dialog.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './player-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerInfoDialogComponent implements OnInit {
  account: AccountResolved | null = null;
  isMobile: boolean = false;

  constructor(
    private playerStatusService: PlayerStatusService,
    public dataStoreService: DataStoreService,
    private cdr: ChangeDetectorRef,
    private dialogRef: DialogRef<MessageDialogComponent>,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private authenticationService: AuthenticationService
  ) {}

  get playerName(): string {
    return `${this.dataStoreService.playerInfoInMemory?.firstName} ${this.dataStoreService.playerInfoInMemory?.lastName}`;
  }

  ngOnInit(): void {
    this.playerStatusService.balanceSub$?.pipe(untilDestroyed(this)).subscribe((response) => {
      if (response) {
        this.account = response;
        this.cdr.markForCheck();
      }
    });

    this.breakpointObserver
      .observe([AppBreakpoints.LtSmall2])
      .pipe(untilDestroyed(this))
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
        if (!this.isMobile) {
          this.closeDialog();
        }
      });
  }

  onDeposit() {
    this.closeDialog();
    this.router.navigate(['profile/wallet/deposit']);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onLogout() {
    this.closeDialog();
    this.authenticationService
      .logout()
      .pipe(
        finalize(() => {
          log.debug('onLogout');
          this.router.navigate(['/']);
        })
      )
      .subscribe(() => {});
  }

  onLanguageSelectorMenuClosed() {
    // this.closeDialog();
  }

  onLinkClick() {
    this.closeDialog();
  }
}
