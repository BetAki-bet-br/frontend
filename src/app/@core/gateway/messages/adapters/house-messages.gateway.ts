import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Observable, map } from 'rxjs';
import { MessagesGateway } from '../messages.gateway';
import { PlayerMessage, PopupMessage } from '../messages.models';

/**
 * `MessagesGateway` against our own backend.
 *
 * Thin on purpose, like the other `house-*` adapters: the wire format is the port's own vocabulary,
 * so there is nothing to translate and this file reads as the specification of what the backend has
 * to serve. Every field named in `messages.models.ts` is a field somebody has to implement.
 *
 * Base url: `BrandConfig.api.playerApiUrl`, falling back to `backofficeApiUrl` while these routes
 * live in the same Laravel app as the CMS. Every path is relative to it.
 *
 *   GET    /api/v1/messages                    -> PlayerMessage[]
 *   GET    /api/v1/messages/unread-count       -> { count }
 *   GET    /api/v1/messages/popups             -> PopupMessage[]
 *   PUT    /api/v1/messages/{messageId}/read   -> 204
 *   DELETE /api/v1/messages/{messageId}        -> 204
 *   POST   /api/v1/messages/actions/{actionId} -> 204
 *
 * Three things the backend owns that the port deliberately does not spell out:
 *
 * - **`GET /messages` returns the whole inbox.** The app pages it in the browser, so there is no
 *   paging on the wire. A brand whose players keep thousands of messages is the day this grows a
 *   query string, and the port grows a query object with it.
 * - **The unread count is one number.** Whether the backend keeps popups and inbox apart is its
 *   business; the badge shows the sum.
 * - **The player is the session's.** Nothing here takes a player id, and a message id that is not
 *   theirs is a 404.
 *
 * Both `contents` fields are HTML the operator wrote, and the app renders them without escaping.
 * Whatever writes them is trusted, so keep it that way.
 */
@Injectable()
export class HouseMessagesGateway implements MessagesGateway {
  private readonly http = inject(HttpClient);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1/messages`;
  }

  getMessages(): Observable<PlayerMessage[]> {
    return this.http.get<PlayerMessage[]>(this.base);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`).pipe(map((response) => response.count));
  }

  getPopups(): Observable<PopupMessage[]> {
    return this.http.get<PopupMessage[]>(`${this.base}/popups`);
  }

  markAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${messageId}/read`, {});
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${messageId}`);
  }

  resolveAction(actionId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/actions/${actionId}`, {});
  }
}
