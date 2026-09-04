export interface MenuApi {
  id: number;
  name: string;
  slug: string;
  status: string;
  position: number;
  meta: Meta;
  created_by: number;
  updated_by: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

/** Block of the desktop sidebar a backoffice menu belongs to. Entries with no group fall back to `atalhos`. */
export type MenuGroup = 'atalhos' | 'populares' | 'ajuda';

export interface Meta {
  icon: string;
  class: string;
  routerLink: string;
  categoryId?: string | number;
  group?: MenuGroup;
}
