import { TestBed } from '@angular/core/testing';
import { CredentialsService } from '@app/auth';
import { provideBrandLayout } from '@testing/app-testing';

import { ShellComponent } from './shell.component';

/**
 * `--shell-bottom-inset` is how much of the viewport the fixed mobile bars take from a sheet that
 * rises from the bottom edge (the game detail and the game filters). It is declared on the shell in
 * `src/theme/theme.scss`, which the karma run loads through `src/main.scss`, so the arithmetic is
 * read back from a real element instead of being restated here.
 */
describe('the shell bottom inset', () => {
  function insetOf(shellClasses: string): number {
    const shell = document.createElement('app-shell');
    shell.className = shellClasses;

    const sheet = document.createElement('div');
    sheet.style.marginBottom = 'var(--shell-bottom-inset, 55.5px)';
    shell.appendChild(sheet);
    document.body.appendChild(shell);

    const reserved = parseFloat(getComputedStyle(sheet).marginBottom);
    shell.remove();
    return reserved;
  }

  it('reserves the classic bottom navigation of the default shell', () => {
    expect(insetOf('')).toBeCloseTo(55.5, 1);
  });

  it('reserves the tabs bar for the brands that ship it', () => {
    expect(insetOf('mobile-nav-tabs')).toBeCloseTo(58, 1);
  });

  it('adds the account bar to the tabs bar while both are on screen', () => {
    expect(insetOf('mobile-nav-tabs mobile-account-bar-visible')).toBeCloseTo(115, 1);
  });

  it('adds the account bar to the classic bar as well', () => {
    expect(insetOf('mobile-account-bar-visible')).toBeCloseTo(112.5, 1);
  });
});

/**
 * The class that turns the account bar's height on is the shell's, and it follows the same answer
 * that mounts the bar: the sheets reserve the bar exactly while it is there.
 */
describe('the shell stamping the account bar height', () => {
  function shellWith(mobileAccountBar: boolean): ShellComponent {
    TestBed.configureTestingModule({ providers: [provideBrandLayout({ mobileAccountBar })] });
    return TestBed.runInInjectionContext(() => new ShellComponent());
  }

  it('counts the bar while the player is logged out', () => {
    expect(shellWith(true).showMobileAccountBar()).toBeTrue();
  });

  it('stops counting it once the player logs in', () => {
    const shell = shellWith(true);

    TestBed.inject(CredentialsService).credentials$.next({
      username: '12345678909',
      jwt: 'demo-jwt',
      sessionKey: 'demo-session',
      userId: 1,
      renewalToken: 'demo-renewal',
    });

    expect(shell.showMobileAccountBar()).toBeFalse();
  });
});
