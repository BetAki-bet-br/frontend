import { Message } from '@icore/ngx-portalgateway-api-client-atl';

export interface MessageResolved extends Message {
  showCloseButton?: boolean;
}
