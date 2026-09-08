import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, map, of, tap } from 'rxjs';

import { Banner, BannersService, MenusService } from '@app/@core/backoffice';
import { BRAND } from '@app/@core/brand';
import { MenuGroup } from '@app/@shared/models/menu-api.model';
import { RoutingService } from '@app/@shared/services/routing.service';
import { ShellService } from '@app/shell/shell.service';
import { CdnizePipe } from '../../../@pipes/cdnize.pipe';

/** One backoffice menu entry, flattened for the template. */
interface SidebarItem {
  label: string;
  icon: string;
  routerLink?: string;
  categoryId?: string | number;
}

/** One titled block of the sidebar. */
interface SidebarBlock {
  key: MenuGroup;
  title: string;
  items: SidebarItem[];
}

/** Block order and titles, top to bottom. Menus with no `meta.group` land in `atalhos`. */
const BLOCKS: readonly { key: MenuGroup; title: string }[] = [
  { key: 'atalhos', title: 'Atalhos de cassino' },
  { key: 'populares', title: 'Populares' },
  { key: 'ajuda', title: 'Precisa de ajuda?' },
];

/** Where the user's expand/collapse choice is remembered between visits. */
const COLLAPSED_STORAGE_KEY = 'desktop-sidebar-collapsed';

const BANNER_SLUG = 'banner-sidebar-top';

/**
 * Desktop sidebar of the lobby: CMS banner, promo tiles and the backoffice menus grouped into
 * shortcuts / popular games / help.
 *
 * Only rendered by brands with `layout.desktopSidebar` (see `games-page.html`). `layout.sidebarStyle`
 * picks the skin: `blocks` (default) is the full column above, `pills` drops the banner and the tiles
 * and paints the same menus as 40px pill items on a transparent column.
 *
 * The collapsed state lives in `ShellService` because the header owns the toggle button; this
 * component only reads it, seeds it from `localStorage` on first paint and writes the user's
 * choice back.
 */
@Component({
  selector: 'app-sidebar-desktop',
  templateUrl: './sidebar-desktop.html',
  styleUrl: './sidebar-desktop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdnizePipe, RouterLink],
})
export class SidebarDesktop {
  private readonly menusService = inject(MenusService);
  private readonly bannersService = inject(BannersService);
  private readonly shellService = inject(ShellService);
  private readonly brand = inject(BRAND);
  protected readonly routingService = inject(RoutingService);

  /**
   * `pills`: menus only, on a transparent column. Read once because the brand of a bundle never
   * changes at runtime.
   */
  protected readonly isPills = this.brand.layout.sidebarStyle === 'pills';

  /** Owned by `ShellService`: the header toggle and this component drive the same signal. */
  protected readonly isCollapsed = this.shellService.desktopSidebarCollapsed;

  protected readonly isLoading = signal(true);

  private readonly loadedImages = signal<ReadonlySet<string>>(new Set<string>());

  protected readonly banner = toSignal<Banner | null>(
    // `pills` has no banner slot, so the CMS is never asked for one.
    this.isPills
      ? EMPTY
      : this.bannersService.getBanners({ q: BANNER_SLUG }).pipe(
          map((response) => response.data[0] ?? null),
          catchError(() => of(null)),
        ),
    { initialValue: null },
  );

  private readonly items = toSignal(
    this.menusService.getMenus().pipe(
      tap(() => this.isLoading.set(false)),
      map((menus) =>
        menus.map<SidebarItem & { group: MenuGroup }>((menu) => ({
          label: menu.name,
          icon: menu.meta.icon,
          routerLink: menu.meta.routerLink,
          categoryId: menu.meta.categoryId,
          group: menu.meta.group ?? 'atalhos',
        })),
      ),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  /** The three blocks, in order, with the empty ones dropped. */
  protected readonly blocks = computed<SidebarBlock[]>(() => {
    const items = this.items();

    return BLOCKS.map(({ key, title }) => ({
      key,
      title,
      items: items.filter((item) => item.group === key),
    })).filter((block) => block.items.length > 0);
  });

  constructor() {
    if (this.brand.layout.desktopSidebar) {
      // The design opens the sidebar on ≥ lg; `ShellService` defaults to collapsed for the brands
      // that only ever show the rail.
      this.isCollapsed.set(this.readStoredCollapsed() ?? false);

      effect(() => this.writeStoredCollapsed(this.isCollapsed()));
    }
  }

  protected bannerImage(banner: { cover_url?: string; media?: { desktop?: string } }): string {
    return banner.cover_url ?? banner.media?.desktop ?? '';
  }

  protected onImageLoad(id: string): void {
    this.loadedImages.update((loaded) => new Set(loaded).add(id));
  }

  protected isImageLoaded(id: string): boolean {
    return this.loadedImages().has(id);
  }

  /** Menu entries the brand wants promoted in the sidebar (loyalty club, tournaments, ...). */
  protected isHighlighted(item: SidebarItem): boolean {
    return this.brand.features.highlightedMenuLabels.includes(item.label);
  }

  protected isActive(item: SidebarItem): boolean {
    return !!item.routerLink && this.routingService.isLinkActive(item.routerLink, false);
  }

  /**
   * Navigates, except for the "Suporte ao vivo" entry: `RoutingService` recognises its
   * `routerLink` and opens the live-chat widget instead.
   */
  protected activate(item: SidebarItem): void {
    this.routingService.navigateToMenuItem(item);
  }

  private readStoredCollapsed(): boolean | null {
    try {
      const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      return stored === null ? null : stored === 'true';
    } catch {
      // Private mode / storage disabled: fall back to the design default.
      return null;
    }
  }

  private writeStoredCollapsed(collapsed: boolean): void {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // Nothing to do: the choice simply does not survive the session.
    }
  }
}
