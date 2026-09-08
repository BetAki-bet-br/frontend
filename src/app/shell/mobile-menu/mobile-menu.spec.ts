import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideBrandLayout } from '@testing/app-testing';

import { MobileMenu } from './mobile-menu';

describe('MobileMenu', () => {
  let component: MobileMenu;
  let fixture: ComponentFixture<MobileMenu>;

  describe('classic', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MobileMenu],
      }).compileComponents();

      fixture = TestBed.createComponent(MobileMenu);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('keeps the five brand-artwork items', () => {
      const host = fixture.nativeElement as HTMLElement;

      expect(component.isTabsNav).toBeFalse();
      expect(host.querySelectorAll('img').length).toBe(5);
    });
  });

  describe('tabs', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MobileMenu],
        // The spec brand is BetAki, which integrates a sportsbook: take it away for this block.
        providers: [provideBrandLayout({ mobileNav: 'tabs' }, { sportsbook: undefined })],
      }).compileComponents();

      fixture = TestBed.createComponent(MobileMenu);
      fixture.detectChanges();
    });

    it('renders five flat items, closed by "Menu" while the brand has no sportsbook', () => {
      const host = fixture.nativeElement as HTMLElement;
      const labels = Array.from(host.querySelectorAll('nav > a, nav > button')).map((el) => el.textContent?.trim());

      expect(labels).toEqual(['Início', 'Jogos', 'Ao vivo', 'Promoções', 'Menu']);
      expect(host.querySelectorAll('img').length).toBe(0);
    });
  });

  describe('tabs with a sportsbook', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MobileMenu],
        providers: [provideBrandLayout({ mobileNav: 'tabs' }, { sportsbook: { integration: 'demo', sdk: 'demo' } })],
      }).compileComponents();

      fixture = TestBed.createComponent(MobileMenu);
      fixture.detectChanges();
    });

    it('closes the bar with the product switch instead', () => {
      const host = fixture.nativeElement as HTMLElement;
      const labels = Array.from(host.querySelectorAll('nav > a, nav > button')).map((el) => el.textContent?.trim());

      expect(labels).toEqual(['Início', 'Jogos', 'Ao vivo', 'Promoções', 'Esportes']);
    });
  });
});
