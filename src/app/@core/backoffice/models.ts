export interface BannerTranslation {
  locale: string;
  title?: string;
  alt_text?: string;
  media?: {
    desktop?: string;
    mobile?: string;
  };
}

export interface Banner {
  id: number;
  slug?: string;
  status?: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  countries?: string[];
  publish_at?: string;
  expire_at?: string;
  link_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  media?: {
    desktop?: string;
    mobile?: string;
  };
  translations?: BannerTranslation[];
  created_at?: string;
  updated_at?: string;
}

export interface BannerIndex {
  data: Banner[];
  next_page_url?: string;
  prev_page_url?: string;
}

export interface BannerStoreRequest extends Partial<Banner> {}

export interface FooterTranslation {
  id?: number;
  locale: string;
  legal_title?: string;
  legal_text?: string;
  disclaimer?: string;
}

export interface FooterLink {
  id?: number;
  block?: string;
  label: string;
  url: string;
  target?: string;
  position?: number;
  is_active?: boolean;
  icon?: string;
  [key: string]: any;
}

export interface Footer {
  id: number;
  key: string;
  status: string;
  country: string;
  brand?: string;
  publish_at?: string;
  published_at?: string;
  translations?: FooterTranslation[];
  links?: FooterLink[];
}

export interface FooterIndex {
  current_page: number;
  data: Footer[];
  per_page: number;
  total: number;
}

// Placeholders for entities with missing schemas in specification
export interface Category {
  id?: number;
  [key: string]: any;
}

export interface Menu {
  id?: number;
  [key: string]: any;
}

export interface Showcase {
  id?: number;
  [key: string]: any;
}

export interface Slot {
  id: number;
  title: string;
  cover_url: any;
  status: string;
  provider: string;
  provider_game_id: string;
  tags: Tags;
  position: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: any;
  rtp: string;
  volatility: any;
  min_bet: string;
}

export interface Tags {
  id: number;
  productId: number;
  gameTypeId: number;
  gameTypeName: string;
}

export interface TopList {
  id?: number;
  [key: string]: any;
}

export interface TopWinner {
  id?: number;
  [key: string]: any;
}

export interface Award {
  id?: number;
  [key: string]: any;
}

export interface Setting {
  id?: number;
  [key: string]: any;
}
