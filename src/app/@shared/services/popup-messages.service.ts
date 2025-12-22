import { DestroyRef, Injectable, OnDestroy, inject } from '@angular/core';
import { Logger } from '../logger.service';
import { Message, MessageService } from '@icore/ngx-portalgateway-api-client-atl';
import { catchError, map, Observable, of, switchMap, take } from 'rxjs';
import { Router } from '@angular/router';
import { AuthEvent, AuthEventsService, CredentialsService } from '@app/auth';
import { Dialog } from '@angular/cdk/dialog';
import { PopupMessageDialogComponent } from '../components/popup-message-dialog/popup-message-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const log = new Logger('PopupMessagesService');
@Injectable({
  providedIn: 'root',
})
export class PopupMessagesService implements OnDestroy {
  private messageService = inject(MessageService);
  private router = inject(Router);
  private credentialsService = inject(CredentialsService);
  private authEventsService = inject(AuthEventsService);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);
  private messagesStack: Message[] = [];

  isMessageDisplayed = false;
  canDisplayMessage = true;

  private popupMessagesTimer?: any;

  constructor() {
    // start timer for popup messages - this will remain in place for the lifetime of the service
    // it will go for new popup messages to server only if the user is logged in
    this.startPopupMessagesTimer();
    // Subscribe to authentication events
    this.authEventsService.authEvents$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event === AuthEvent.Login) {
        log.info('User logged in');
        // check for popup messages immediately
        setTimeout(() => this.checkForPopupMessages(), 1000); //wait one second before fetching first popups
      }
    });
  }

  ngOnDestroy() {
    this.stopPopupMessagesTimer();
  }

  fetchPopupMessages(): Observable<any> {
    log.debug('fetchPopupMessages() invoked');
    if (this.isMessageDisplayed) {
      return of();
    }

    return this.messageService.apiPortalV1MessagePopupsGet().pipe(
      map((res) => {
        if (res?.messages) {
          log.debug('fetchPopupMessages returned: ', res.messages);

          this.messagesStack = [...res.messages];
        }
      }),
      catchError((err) => {
        log.debug('fetchPopupMessages returned error: ', err);
        throw err;
      }),
    );
  }

  checkMessages(): Message | null {
    if (this.messagesStack.length > 0 && !this.isMessageDisplayed && this.canDisplayMessage) {
      return this.messagesStack[0];
    }
    return null;
  }

  resolveMessageAction(actionId: number) {
    return this.messageService.apiPortalV1MessageHandleActionIdPost(actionId).pipe(
      map((res) => {
        this.messagesStack.shift();
        return res;
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }

  private startPopupMessagesTimer() {
    // start checking for popup messages on timer if not already started
    if (!this.popupMessagesTimer) {
      this.popupMessagesTimer = setInterval(() => {
        log.debug('Checking for popup messages... Triggered by timer');
        this.checkForPopupMessages();
      }, 30 * 1000);
      log.debug('Popup messages timer started');
    }
  }

  private stopPopupMessagesTimer() {
    if (this.popupMessagesTimer) {
      clearInterval(this.popupMessagesTimer);
      this.popupMessagesTimer = undefined;
      log.debug('Popup messages timer stopped');
    }
  }

  private checkForPopupMessages() {
    log.debug('checkForPopupMessages() invoked');
    // Only check if user is authenticated
    if (this.credentialsService.isAuthenticated()) {
      this.fetchPopupMessages()
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.openPopupMessage();
          },
        });
    }
  }

  private openPopupMessage() {
    const messageToDisplay = this.checkMessages();

    if (messageToDisplay && this.canPopupOpen()) {
      const dialogRef = this.dialog.open<{ actionId: number | null }>(PopupMessageDialogComponent, {
        data: messageToDisplay,
        disableClose: true,
      });

      this.isMessageDisplayed = true;

      dialogRef.closed
        .pipe(
          switchMap((res) => {
            this.isMessageDisplayed = false;

            if (res?.actionId || res?.actionId === 0) {
              return this.resolveMessageAction(res.actionId);
            }

            return of(null);
          }),
        )
        .subscribe(() => {
          this.isMessageDisplayed = false;
        });
    }
  }

  private canPopupOpen() {
    if (
      this.router.url.includes('game/') ||
      this.router.url.includes('sportsbook') ||
      this.router.url.includes('deposit')
    ) {
      return false;
    }
    return true;
  }
}
