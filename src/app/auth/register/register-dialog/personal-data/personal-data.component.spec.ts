import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataComponent } from './personal-data.component';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AuthenticationService } from '@app/auth/authentication.service';
import { ConfigurationService } from '@app/@core/configuration.service';
import { ActivatedRoute } from '@angular/router';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PipesModule } from '@app/@pipes/pipes.module';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        PipesModule,
        PersonalDataComponent,
        MatAutocomplete,
      ],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
