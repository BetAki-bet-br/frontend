import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GhostColorLayer } from './ghost-color-layer';

describe('GhostColorLayer', () => {
  let component: GhostColorLayer;
  let fixture: ComponentFixture<GhostColorLayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GhostColorLayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GhostColorLayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
