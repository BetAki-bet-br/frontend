import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarMobile } from './sidebar-mobile';
import { SidebarService } from '@app/@shared/services/sidebar-mobile.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { PlayerService } from '@app/@shared/services/player.service-v2';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { RoutingService } from '@app/@shared/services/routing.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

describe('SidebarMobile', () => {
  let component: SidebarMobile;
  let fixture: ComponentFixture<SidebarMobile>;

  // Mocks
  const mockSidebarService = {
    isOpen: signal(true),
    close: jasmine.createSpy('close')
  };
  const mockCredentialsService = {
    isAuthenticated: signal(true)
  };
  const mockRoutingService = {};
  const mockAuthService = {
    logout: jasmine.createSpy('logout')
  };
  const mockPlayerService = {
    getPlayerDetails: () => of({ player: {} })
  };
  const mockTawkToScriptService = {
    maximize: jasmine.createSpy('maximize')
  };
  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarMobile, NgOptimizedImage],
      providers: [
        { provide: SidebarService, useValue: mockSidebarService },
        { provide: CredentialsService, useValue: mockCredentialsService },
        { provide: RoutingService, useValue: mockRoutingService },
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: PlayerService, useValue: mockPlayerService },
        { provide: TawkToScriptService, useValue: mockTawkToScriptService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display banners with ngSrc', () => {
    // Check for Liminha banner
    const liminhaImg = fixture.debugElement.query(By.css('img[alt="Banner Liminha"]'));
    expect(liminhaImg).toBeTruthy();
    expect(liminhaImg.attributes['ngSrc']).toContain('assets/liminha.jpg');
    // priority is an input, not necessarily an attribute in the DOM output in all versions, but usually present or handled by checking inputs.
    // In Angular tests for ngSrc, checking the attribute usually works if it reflects.
    // But better to check the component instance properties if it was a directive, but here it's an attribute on the element.
    // 'priority' attribute presence is enough.
  });

  it('should display second banner with ngSrc', () => {
    // Check for Banner2
    const banner2Img = fixture.debugElement.query(By.css('img[alt="Banner"]'));
    expect(banner2Img).toBeTruthy();
    expect(banner2Img.attributes['ngSrc']).toContain('assets/banner2.png');
  });
});