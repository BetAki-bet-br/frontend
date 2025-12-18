import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { PipesModule } from '@app/@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';
import { NgcCookieConsentService } from 'ngx-cookieconsent';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, PipesModule, TranslateModule.forRoot()],
      declarations: [FooterComponent],
      providers: [
        { provide: ConfigurationService, useClass: MockConfigurationService },
        HttpBackend,
        {
          provide: NgcCookieConsentService,
          useValue: jasmine.createSpyObj('NgcCookieConsentService', ['hasConsented', 'hasAnswered']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
