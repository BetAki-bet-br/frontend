import { Injectable, inject } from '@angular/core';
import {
  ChangeMessageTypeEnum,
  MessageExtended,
  MessageService,
  PopupAction,
} from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, map } from 'rxjs';
import { MessagesGateway } from '../messages.gateway';
import { MessageAction, MessageState, PlayerMessage, PopupMessage } from '../messages.models';

/**
 * `MessagesGateway` on top of Comtrade's PortalGateway, through the OpenAPI client generated from
 * `swagger.json` into `@icore/ngx-portalgateway-api-client-atl`.
 *
 * This is the only file in the application allowed to know that the inbox is paged (and that the
 * app wants all of it), that the unread badge is two counters the gateway keeps apart, and that
 * marking a message read is a `PUT` carrying an enum.
 */
@Injectable()
export class ComtradeMessagesGateway implements MessagesGateway {
  private readonly api = inject(MessageService);

  /**
   * The inbox is paged and the app is not: it holds every message and does its own paging, so one
   * page big enough to be all of them is what gets asked for.
   */
  private static readonly PAGE_SIZE = 10000;
  private static readonly PAGE_NUMBER = 1;

  getMessages(): Observable<PlayerMessage[]> {
    return this.api
      .apiPortalV1MessagesGet(ComtradeMessagesGateway.PAGE_SIZE, ComtradeMessagesGateway.PAGE_NUMBER, true)
      .pipe(map((response) => (response?.messages ?? []).map(toPlayerMessage)));
  }

  getUnreadCount(): Observable<number> {
    return this.api
      .apiPortalV1MessageUnreadCountGet()
      .pipe(map((response) => (response?.unreadCount ?? 0) + (response?.unreadPopupCount ?? 0)));
  }

  getPopups(): Observable<PopupMessage[]> {
    return this.api.apiPortalV1MessagePopupsGet().pipe(
      map((response) =>
        (response?.messages ?? []).map((message) => ({
          id: message.id ?? 0,
          title: message.title ?? '',
          contents: message.contents ?? '',
          actions: (message.actions ?? []).map(toAction),
        })),
      ),
    );
  }

  markAsRead(messageId: number): Observable<void> {
    return this.api.apiPortalV1MessageMessageIdPut(messageId, ChangeMessageTypeEnum.Read).pipe(map(() => undefined));
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.api.apiPortalV1MessageMessageIdDelete(messageId).pipe(map(() => undefined));
  }

  resolveAction(actionId: number): Observable<void> {
    return this.api.apiPortalV1MessageHandleActionIdPost(actionId).pipe(map(() => undefined));
  }
}

/**
 * Narrows a state the gateway sent to one the port knows.
 *
 * The two vocabularies spell every state the same way, so this is a check and not a translation
 * table: a value the port has no name for becomes `undefined` and the screen treats the message as
 * one it cannot sort, instead of a raw provider string reaching a comparison.
 */
function toState(value: string | null | undefined): MessageState | undefined {
  return value && Object.prototype.hasOwnProperty.call(MessageState, value) ? (value as MessageState) : undefined;
}

function toPlayerMessage(message: MessageExtended): PlayerMessage {
  return {
    id: message.id ?? 0,
    title: message.title ?? '',
    contents: message.contents ?? '',
    createdAt: message.createdDate ?? '',
    state: toState(message.state),
  };
}

function toAction(action: PopupAction): MessageAction {
  return { id: action.id ?? 0, label: action.name ?? '' };
}
