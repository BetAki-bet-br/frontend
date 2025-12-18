export interface RegisterData {
  username: string;
  email: string;
  password: string;
  cpf: string;
  dateOfBirth: string;
  promotionalOffers: boolean;
  trackingSource?: AffiliateDataRegister;
  fingerprintRequestId?: string;
  phone?: string;
}

export interface AffiliateData {
  token: string;
  affiliateId: string;
}

export interface AffiliateDataRegister {
  marketingChannel: string;
  marketingSource: string;
  btag: string;
}
