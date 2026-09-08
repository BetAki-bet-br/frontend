import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { BrandConfig } from '@app/@core/brand';
import { MenuApi } from '@app/@shared/models/menu-api.model';
import { provideBrandLayout } from '@testing/app-testing';

import { SidebarDesktop } from './sidebar-desktop';

/** Two backoffice menus, one per block, enough to render the grouped navigation. */
const MENUS: Partial<MenuApi>[] = [
  {
    id: 1,
    name: 'Cassino ao vivo',
    meta: { icon: '/assets/icons/live.svg', class: '', routerLink: '/games/live', group: 'atalhos' },
  },
  {
    id: 2,
    name: 'Suporte ao vivo',
    meta: { icon: '/assets/icons/support.svg', class: '', routerLink: 'support', group: 'ajuda' },
  },
];

describe('SidebarDesktop', () => {
  /** Builds the component for a brand whose `layout` is the default one plus `layout`. */
  function createFor(layout: Partial<BrandConfig['layout']>): ComponentFixture<SidebarDesktop> {
    TestBed.configureTestingModule({
      imports: [SidebarDesktop],
      providers: [provideBrandLayout(layout)],
    });

    const fixture = TestBed.createComponent(SidebarDesktop);
    const http = TestBed.inject(HttpTestingController);

    http.expectOne((request) => request.url.endsWith('/api/v1/menus')).flush({ data: MENUS });
    // `blocks` also asks the CMS for the top banner; `pills` never subscribes to that request.
    http.match((request) => request.url.endsWith('/api/v1/banners')).forEach((request) => request.flush({ data: [] }));

    fixture.detectChanges();
    return fixture;
  }

  it('renders the promo tiles in the default `blocks` style', () => {
    const element: HTMLElement = createFor({ desktopSidebar: true }).nativeElement;

    expect(element.querySelectorAll('a[routerlink="/promotions"]').length).toBe(2);
    expect(element.querySelector('aside')?.className).toContain('bg-shark-900');
    expect(element.querySelector('button')?.className).toContain('rounded-xl');
  });

  it('renders pill items and no banner or tiles in the `pills` style', () => {
    const element: HTMLElement = createFor({ desktopSidebar: true, sidebarStyle: 'pills' }).nativeElement;

    expect(element.querySelectorAll('a').length).toBe(0);
    expect(element.querySelector('aside')?.className).not.toContain('bg-shark-900');

    const items = element.querySelectorAll<HTMLButtonElement>('nav button');
    expect(items.length).toBe(MENUS.length);
    expect(items[0].className).toContain('rounded-full');
    expect(items[0].className).toContain('h-10');
  });
});
