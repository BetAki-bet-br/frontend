export interface LegitimuzRequest {
  deviceinfo: string;
  hardware_concurrency: number;
  device_memory: number;
  meta: {
    cpf: string;
  };
  location_accepted: boolean;
}

export interface LegitimuzResponse {
  message: string;
  alerts: unknown[];
  body: {
    action: string;
    device: string;
    ip_address: string;
    fingerprint: string;
    latitude: string;
    longitude: string;
    location_accepted: boolean;
    ip_is_vpn: boolean;
    ip_is_tor: boolean;
    ip_is_botnet: boolean;
    ip_is_spammer: boolean;
    ip_is_proxy: boolean;
    country: string;
    city: string;
    continent: string;
    region: string;
    region_code: string;
    postal_code: string;
    timezone: string;
    asn: string;
    as_organization: null;
    tenant_id: number;
    id_integration: number;
    cpf: string;
    email: null;
    created_at: string;
    updated_at: string;
    id: number;
    country_alert: string;
    id_ibge: string;
  };
}
