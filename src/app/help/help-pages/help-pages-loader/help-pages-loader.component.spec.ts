import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { PipesModule } from '@app/@pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { HelpPagesLoaderComponent } from './help-pages-loader.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('HelpPagesLoaderComponent', () => {
  let component: HelpPagesLoaderComponent;
  let fixture: ComponentFixture<HelpPagesLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpPagesLoaderComponent],
      imports: [RouterTestingModule, HttpClientModule, PipesModule, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPagesLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
