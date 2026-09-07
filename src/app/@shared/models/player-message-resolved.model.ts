import { PlayerMessage } from '@app/@core/gateway';

/** An inbox message with the blanks the table cannot render already filled in. */
export interface PlayerMessageResolved extends PlayerMessage {
  titleResolved: string;
  contentsResolved: string;
  /** Whether the row is ticked, for the delete-selected action. */
  selected: boolean;
}
