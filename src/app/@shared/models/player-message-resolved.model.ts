import { MessageExtended } from '@icore/ngx-portalgateway-api-client-atl';

export interface PlayerMessageResolved extends MessageExtended {
  titleResolved?: string;
  createdDateDate?: Date;
  createdDateResolved?: string;
  contentsResolved?: string;
  selected?: boolean;
}
