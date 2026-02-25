import { DIALOG_DATA, DialogRef, DialogModule } from '@angular/cdk/dialog'; // Added DialogModule
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout'; // Added LayoutModule
// Added CommonModule
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';
import { MessageResolved } from '@app/@shared/models/message.model';
import { BaseDialogComponent } from '@app/@shared/components/base-dialog/base-dialog.component'; // Added BaseDialogComponent
import { PopupMessagesService } from '@app/@shared/services/popup-messages.service';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-message-dialog',
  templateUrl: './popup-message-dialog.component.html',
  styleUrls: ['./popup-message-dialog.component.scss'],
  imports: [DialogModule, LayoutModule, ButtonComponent, TranslateModule, BaseDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupMessageDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject<
    DialogRef<{
      actionId: number | null;
    }>
  >(DialogRef);
  data = inject<MessageResolved>(DIALOG_DATA);
  private popupMessageService = inject(PopupMessagesService);
  private sanitizer = inject(DomSanitizer);
  private breakpointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);

  isMobile = false;
  private subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.breakpointObserver.observe([AppBreakpoints.LtSmall2]).subscribe((result) => {
        this.isMobile = result.matches;
        this.cdr.markForCheck();
      }),
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
