import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideBrandLayout } from '@testing/app-testing';

import { HeaderFloating } from './header-floating';

/** Renders the bar with the parent's inputs and hands back the host element. */
function render(inputs: { isLoggedIn: boolean; amount?: number; isBalanceVisible?: boolean }): HTMLElement {
  const fixture: ComponentFixture<HeaderFloating> = TestBed.createComponent(HeaderFloating);
  fixture.componentRef.setInput('isLoggedIn', inputs.isLoggedIn);
  fixture.componentRef.setInput('amount', inputs.amount ?? 0);
  fixture.componentRef.setInput('isBalanceVisible', inputs.isBalanceVisible ?? true);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('HeaderFloating', () => {
  describe('on a brand without a sportsbook', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderFloating],
        // The spec brand is BetAki, which integrates a sportsbook: take it away for this block.
        providers: [provideBrandLayout({ header: 'floating', desktopSidebar: true }, { sportsbook: undefined })],
      }).compileComponents();
    });

    it('should create', () => {
      expect(render({ isLoggedIn: false })).toBeTruthy();
    });

    it('renders the product links', () => {
      const labels = Array.from(render({ isLoggedIn: false }).querySelectorAll('a[href]')).map((a) =>
        a.textContent?.trim(),
      );

      expect(labels).toContain('Cassino');
      expect(labels).toContain('Ao vivo');
      expect(labels).toContain('Promoções');
    });

    it('offers both account calls to action while logged out, and no balance', () => {
      const host = render({ isLoggedIn: false });

      expect(host.textContent).toContain('Criar conta');
      expect(host.textContent).toContain('Entrar');
      expect(host.textContent).not.toContain('Depósito');
    });

    it('trades the calls to action for the balance block once logged in', () => {
      const host = render({ isLoggedIn: true, amount: 1234.5, isBalanceVisible: true });

      expect(host.textContent).toContain('Depósito');
      // The number format belongs to the locale the app registers, not to this component.
      expect(host.textContent).toContain('R$');
      expect(host.textContent).not.toContain('Criar conta');
    });

    it('leaves "Esportes" out of the bar', () => {
      expect(render({ isLoggedIn: false }).textContent).not.toContain('Esportes');
    });
  });

  describe('on a brand with a sportsbook', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HeaderFloating],
        providers: [provideBrandLayout({ header: 'floating' }, { sportsbook: { integration: 'demo', sdk: 'demo' } })],
      }).compileComponents();
    });

    it('adds "Esportes" after the separator', () => {
      expect(render({ isLoggedIn: false }).textContent).toContain('Esportes');
    });
  });
});
