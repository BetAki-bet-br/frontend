import { MessageAction } from '@app/@core/gateway';

/**
 * What the popup dialog renders.
 *
 * Looser than the port's `PopupMessage` on purpose: most of these come from
 * {@link MessagesGateway.getPopups}, but the login screen makes a couple of its own to explain a
 * refusal, and those have no id and no gateway behind them.
 */
export interface MessageResolved {
  title?: string;
  /** HTML, rendered as it comes. */
  contents?: string;
  actions?: MessageAction[];
  showCloseButton?: boolean;
}
