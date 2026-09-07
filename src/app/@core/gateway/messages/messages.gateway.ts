import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerMessage, PopupMessage } from './messages.models';

/**
 * Everything the application asks about what the operator has to say to the player.
 *
 * Same rules as the other ports:
 *
 * - Only the types in `messages.models.ts` cross this boundary. No vendor DTO, no vendor enum.
 * - The provider's configuration is the adapter's problem. How many messages a page holds, and in
 *   which order the gateway is asked for them, never appears in a signature here.
 * - The clocks belong to the caller. `MessageService` polls the inbox on a timer that speeds up on
 *   the inbox screen, and `PopupMessagesService` checks for popups every thirty seconds; a gateway
 *   answers the call it was given.
 *
 * The two halves are one port because they are one feature to the operator: the same message can
 * be sent to the inbox or thrown up as a dialog, and the unread badge counts both.
 */
export interface MessagesGateway {
  /** Everything in the player's inbox. Sorting is the screen's business. */
  getMessages(): Observable<PlayerMessage[]>;

  /** How many the player has not read, inbox and popups together: the number on the badge. */
  getUnreadCount(): Observable<number>;

  /**
   * The popups waiting to be shown, most pressing first.
   *
   * The app shows one at a time and asks again later, so a gateway that has several may send them
   * all.
   */
  getPopups(): Observable<PopupMessage[]>;

  /** Marks one inbox message as read. */
  markAsRead(messageId: number): Observable<void>;

  /** Removes one message from the inbox for good. */
  deleteMessage(messageId: number): Observable<void>;

  /**
   * Tells the gateway which button the player pressed on a popup.
   *
   * Also how the updated terms and conditions are accepted: that dialog is a popup like any other,
   * and its action id is what says yes.
   */
  resolveAction(actionId: number): Observable<void>;
}

/**
 * The messages gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const MESSAGES_GATEWAY = new InjectionToken<MessagesGateway>('MESSAGES_GATEWAY');
