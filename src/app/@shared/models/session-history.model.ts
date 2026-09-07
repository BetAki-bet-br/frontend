import { PlayerSession } from '@app/@core/gateway';

/** A login from the gateway, plus the strings the security screen shows. */
export interface SessionHistory extends PlayerSession {
  client: string;
  userAgent: string;
  logonLocal: string;
  logoutLocal?: string;
  statusResolved: string;
  ipResolved: string;
}
