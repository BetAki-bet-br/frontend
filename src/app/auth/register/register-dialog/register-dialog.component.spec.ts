import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDialogComponent } from './register-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationService } from '@app/auth';
import { ConfigurationService } from '@app/@core/configuration.service';
import { MockAuthenticationService } from '@app/auth/authentication.service.mock';
import { MockConfigurationService } from '@app/@core/configuration.service.mock';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { PlayerService } from '@icore/ngx-portalgateway-api-client-atl';
import { ActivatedRoute } from '@angular/router';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('RegisterDialogComponent', () => {
  let component: RegisterDialogComponent;
  let fixture: ComponentFixture<RegisterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        HttpClientTestingModule,
        PipesModule,
      ],
      declarations: [RegisterDialogComponent, MatAutocomplete],
      providers: [
        { provide: DialogRef, useValue: {} },
        { provide: DIALOG_DATA, useValue: {} },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: ConfigurationService, useClass: MockConfigurationService },
        { provide: PlayerService, useClass: MockCtgApiService },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Dialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
