export interface MenuItem {
  label: string;
  icon: string;
  iconActive?: string;
  routerLink?: string;
  isSpecial?: boolean;
  action?: () => void;
  exact?: boolean;
}
