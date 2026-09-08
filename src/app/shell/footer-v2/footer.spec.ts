import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BRAND_CONFIG } from '@app/@core/brand';
import { provideBrandLayout } from '@testing/app-testing';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Footer (regulatory)', () => {
  let element: HTMLElement;

  beforeEach(() => {
    // The root `beforeEach` of `global-test-setup.spec.ts` already registered the application
    // providers; this one only shadows BRAND, because providers registered later win.
    TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideBrandLayout({ footer: 'regulatory' })],
    });

    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders the regulatory disclaimer', () => {
    expect(element.textContent).toContain(BRAND_CONFIG.legal.disclaimer);
  });

  it('renders the link columns plus the payments one', () => {
    const titles = Array.from(element.querySelectorAll('h5')).map((title) => title.textContent?.trim());

    expect(titles).toContain(`Sobre a ${BRAND_CONFIG.name}`);
    expect(titles).toContain('Pagamentos');
  });

  it('renders the copyright line and the closing wordmark', () => {
    expect(element.textContent).toContain(`${new Date().getFullYear()} ${BRAND_CONFIG.name}`);
    expect(element.textContent).toContain('Todos os direitos reservados');
    expect(element.querySelector('img.opacity-30')).toBeTruthy();
  });
});
