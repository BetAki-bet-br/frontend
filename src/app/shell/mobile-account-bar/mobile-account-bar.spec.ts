import { TestBed } from '@angular/core/testing';
import { CredentialsService } from '@app/auth';
import { provideBrandLayout } from '@testing/app-testing';

import { ShellComponent } from '../shell-common/shell.component';
import { MobileAccountBar } from './mobile-account-bar';

describe('MobileAccountBar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileAccountBar],
      providers: [provideBrandLayout({ mobileAccountBar: true })],
    }).compileComponents();
  });

  it('renders both account calls to action', () => {
    const fixture = TestBed.createComponent(MobileAccountBar);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Criar conta');
    expect(host.textContent).toContain('Entrar');
  });
});

/**
 * Whether the bar is on screen at all is the shell's call, because the same answer pads the content
 * underneath it. The rule is read straight off the component class: rendering the whole shell would
 * only add the header, the footer and the two mobile menus to the question.
 */
describe('the shell mounting the account bar', () => {
  function shellWith(mobileAccountBar: boolean): ShellComponent {
    TestBed.configureTestingModule({ providers: [provideBrandLayout({ mobileAccountBar })] });
    return TestBed.runInInjectionContext(() => new ShellComponent());
  }

  it('shows the bar while the player is logged out', () => {
    expect(shellWith(true).showMobileAccountBar()).toBeTrue();
  });

  it('hides the bar once the player logs in', () => {
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

  it('never shows it for a brand that did not ask for it', () => {
    expect(shellWith(false).showMobileAccountBar()).toBeFalse();
  });
});
