export interface MenuItem {
  label: string;
  icon: string;
  iconActive?: string;
  routerLink?: string;
  isSpecial?: boolean;
  action?: () => void;
  exact?: boolean;
  class?: string;
  slug?: string;
}

/** Which inline glyph a `tabs` item draws. Brand artwork never reaches this layout. */
export type TabIcon = 'home' | 'games' | 'live' | 'promotions' | 'sports' | 'menu';

/**
 * One item of the `tabs` mobile navigation (`BrandConfig.layout.mobileNav === 'tabs'`).
 *
 * Unlike {@link MenuItem}, the icon is a glyph key and not an asset url: the whole bar is drawn with
 * inline strokes in `currentColor`, so the active and inactive states are a colour and not a second
 * file.
 */
export interface TabMenuItem {
  label: string;
  icon: TabIcon;
  routerLink?: string;
  exact?: boolean;
  action?: () => void;
}
