import { FaceAuthParams } from '@app/auth/auth-dialog.service';
import { WithdrawalEligibilityStatusEnum } from '@icore/ngx-portalgateway-api-client-atl';

export interface PaymentMethod {
  type: string;
  name: string;
  fee: string;
  processingTime: string;
  min: number;
  max: number;
  imgAssetPath: string;
  currencyCode: string;
}

export interface CreateWithdrawalResponse {
  faceAuthParams?: FaceAuthParams;
  abortFurtherProcessing?: boolean;
  declineReason?: string | null;
  declineReasonCode?: string | null;
  eligibilityStatus?: WithdrawalEligibilityStatusEnum;
}
