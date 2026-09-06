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
import { NgOptimizedImage } from '@angular/common';
import { MenusService } from '@app/@core/backoffice';

describe('SidebarMobile', () => {
  let component: SidebarMobile;
  let fixture: ComponentFixture<SidebarMobile>;

  // Mocks
  const mockSidebarService = {
    isOpen: signal(true),
    close: jasmine.createSpy('close'),
  };
  const mockCredentialsService = {
    isAuthenticated: signal(true),
  };
  const mockRoutingService = {};
  const mockAuthService = {
    logout: jasmine.createSpy('logout'),
  };
  const mockPlayerService = {
    getPlayerDetails: () => of({ player: {} }),
  };
  const mockTawkToScriptService = {
    maximize: jasmine.createSpy('maximize'),
  };
  const mockRouter = {
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
  };
  const mockMenusService = {
    getMenus: () => of([]),
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
        { provide: Router, useValue: mockRouter },
        { provide: MenusService, useValue: mockMenusService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
