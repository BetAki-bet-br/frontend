import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameFilterModal } from './game-filter-modal';

describe('GameFilterModal', () => {
  let component: GameFilterModal;
  let fixture: ComponentFixture<GameFilterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFilterModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameFilterModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const element: HTMLElement = fixture.nativeElement;
    const title = element.querySelector('h2');
    expect(title?.textContent).toContain('Filtros');
  });

  it('should emit close event on close button click', () => {
    spyOn(component.closeModal, 'emit');
    const element: HTMLElement = fixture.nativeElement;
    const closeButton = element.querySelector('button.absolute');
    (closeButton as HTMLElement)?.click();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should emit close event on backdrop click', () => {
    spyOn(component.closeModal, 'emit');
    const element: HTMLElement = fixture.nativeElement;
    const backdrop = element.querySelector('.fixed.inset-0');
    (backdrop as HTMLElement)?.click();
    expect(component.closeModal.emit).toHaveBeenCalled();
  });
});
