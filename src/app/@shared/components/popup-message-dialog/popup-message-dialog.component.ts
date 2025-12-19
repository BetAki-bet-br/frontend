import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { MessageResolved } from '@app/@shared/models/message.model';
import { PopupMessagesService } from '@app/@shared/services/popup-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-message-dialog',
  templateUrl: './popup-message-dialog.component.html',
  styleUrls: ['./popup-message-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupMessageDialogComponent implements OnInit, OnDestroy {
  isMobile = false;
  private subscriptions = new Subscription();

  constructor(
    private dialogRef: DialogRef<{ actionId: number | null }>,
    @Inject(DIALOG_DATA)
    public data: MessageResolved,
    private popupMessageService: PopupMessagesService,
    private sanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {
    this.subscriptions.add(
      this.breakpointObserver.observe([AppBreakpoints.LtSmall2]).subscribe((result) => {
        this.isMobile = result.matches;
        this.cdr.markForCheck();
      })
    );
  }

  get sanitizedContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.data.contents || '');
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  confirm(actionId: number | null) {
    this.dialogRef.close({ actionId: actionId });
  }

  cancel(actionId: number | null) {
    this.dialogRef.close({ actionId: actionId });
  }
}
