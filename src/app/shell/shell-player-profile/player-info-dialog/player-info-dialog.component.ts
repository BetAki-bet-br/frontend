import { MatButtonModule } from '@angular/material/button';
import { DialogRef } from '@angular/cdk/dialog';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { AppBreakpoints, Logger } from '@app/@shared';
import { MessageDialogComponent } from '@app/@shared/components/message-dialog/message-dialog.component';
import { AccountResolved } from '@app/@shared/models';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { AuthenticationService } from '@app/auth';
import { finalize } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

const log = new Logger('PlayerInfoDialogComponent');

@Component({
  selector: 'app-player-info-dialog',
  templateUrl: './player-info-dialog.component.html',
  styleUrls: ['../shell-player-profile-common.scss', './player-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatButtonModule, RouterLink, DecimalPipe, RouterLinkActive],
})
export class PlayerInfoDialogComponent implements OnInit {
  private playerStatusService = inject(PlayerStatusService);
  private destroyRef = inject(DestroyRef);
  dataStoreService = inject(DataStoreService);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject<DialogRef<MessageDialogComponent>>(DialogRef);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private authenticationService = inject(AuthenticationService);

  account: AccountResolved | null = null;
  isMobile: boolean = false;

  get playerName(): string {
    return `${this.dataStoreService.playerInfoInMemory?.firstName} ${this.dataStoreService.playerInfoInMemory?.lastName}`;
  }

  ngOnInit(): void {
    this.playerStatusService.balanceSub$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response) {
        this.account = response;
        this.cdr.markForCheck();
      }
    });

    this.breakpointObserver
      .observe([AppBreakpoints.LtSmall2])
      .pipe(takeUntilDestroyed(this.destroyRef))
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
        }),
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
