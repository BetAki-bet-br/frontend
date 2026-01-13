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

export interface Meta {
  icon: string;
  class: string;
  routerLink: string;
}
