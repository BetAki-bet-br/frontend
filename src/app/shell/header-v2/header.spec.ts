import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideBrandLayout } from '@testing/app-testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  describe('on the brand-bar layout', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Header],
      }).compileComponents();

      fixture = TestBed.createComponent(Header);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('keeps the filled bar', () => {
      expect(component.headerClasses()).toContain('bg-surface-header');
    });
  });

  describe('on the floating layout', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [Header],
        providers: [provideBrandLayout({ header: 'floating' })],
      }).compileComponents();

      fixture = TestBed.createComponent(Header);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('hands the bar over to the floating chrome', () => {
      expect((fixture.nativeElement as HTMLElement).querySelector('app-header-floating')).toBeTruthy();
    });

    it('paints no bar of its own outside game mode', () => {
      expect(component.headerClasses()).not.toContain('bg-surface-header');
      expect(component.headerClasses()).toContain('pointer-events-none');
    });
  });
});
