import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '@app/material.module';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MaterialModule, LoaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;

    // Set initial input values
    component.isLoading = false;
    component.size = 1;
    component.message = '';

    fixture.detectChanges();
  });

  it('should not be visible by default', () => {
    const element = fixture.nativeElement;
    const div = element.querySelector('div');
    expect(div).toBeNull();
  });

  it('should be visible when app is loading', () => {
    component.isLoading = true;
    fixture.detectChanges();

    const loaderElement: HTMLElement = fixture.nativeElement.querySelector('.loader');
    expect(loaderElement).toBeNull();
  });
});
