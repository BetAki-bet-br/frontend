/**
 * The vocabulary the application uses to talk about what the operator sends the player: the inbox,
 * and the popups that interrupt them.
 *
 * Nothing here comes from a vendor SDK on purpose. These are the types `MessageService`,
 * `PopupMessagesService` and the inbox screen work with, and every adapter under `adapters/`
 * translates its own provider's payloads into them. This file is also the shortest description of
 * the messaging half of the house backend.
 *
 * Both kinds of message carry HTML the operator wrote, and the screens render it as it comes. That
 * is a decision the product already made, not something this port introduces: a gateway is
 * trusted, and its content goes through `bypassSecurityTrustHtml`.
 */

/**
 * Where a message is in the player's inbox.
 *
 * Written as a constant object and not a bare union because the screen compares against it and
 * sorts on it. Only `Unread` and `Read` are acted on; the rest are states the operator's tooling
 * can put a message in, and a screen that receives one just shows the message.
 */
export const MessageState = {
  Pending: 'Pending',
  Read: 'Read',
  Unread: 'Unread',
  Expired: 'Expired',
  Inactive: 'Inactive',
  OneTime: 'OneTime',
  Deleted: 'Deleted',
} as const;
export type MessageState = (typeof MessageState)[keyof typeof MessageState];

/** One message in the player's inbox. */
export interface PlayerMessage {
  /** The gateway's id for the message. What {@link MessagesGateway.markAsRead} takes. */
  id: number;
  title: string;
  /** HTML, rendered as it comes. */
  contents: string;
  /** ISO timestamp. */
  createdAt: string;
  /** Absent when the gateway reported a state this port has no name for. */
  state?: MessageState;
}

/**
 * A button on a popup.
 *
 * The id is what the gateway wants back once the player has pressed it: accepting new terms and
 * conditions is one of these, and so is dismissing a house announcement.
 */
export interface MessageAction {
  id: number;
  /** What the button reads. Already in the player's language when the gateway sends it. */
  label: string;
}

/** A message the operator wants shown as a dialog, now. */
export interface PopupMessage {
  id: number;
  title: string;
  /** HTML, rendered as it comes. */
  contents: string;
  /** What the dialog offers. A popup with none is dismissed by closing it. */
  actions: MessageAction[];
}
