import { LogonSessionDetail } from '@icore/ngx-portalgateway-api-client-atl';

export interface SessionHistory extends LogonSessionDetail {
  client: string;
  userAgent: string;
  logonLocal: string;
  logoutLocal?: string;
  statusResolved: string;
  ipResolved: string;
}
