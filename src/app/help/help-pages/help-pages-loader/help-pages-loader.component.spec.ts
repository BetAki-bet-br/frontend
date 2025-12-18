import { RouterModule } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PipesModule } from '@app/@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { HelpPagesLoaderComponent } from './help-pages-loader.component';

describe('HelpPagesLoaderComponent', () => {
  let component: HelpPagesLoaderComponent;
  let fixture: ComponentFixture<HelpPagesLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipesModule, TranslateModule.forRoot(), HelpPagesLoaderComponent, RouterModule],
      providers: [provideHttpClient(withInterceptorsFromDi())],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPagesLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
