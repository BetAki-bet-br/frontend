import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameDetailModal } from './game-detail-modal';
import { GameMain } from '@/app/core/models/game.models';

describe('GameDetailModal', () => {
  let component: GameDetailModal;
  let fixture: ComponentFixture<GameDetailModal>;

  const mockGame: GameMain = {
    id: 1,
    externalId: 'test-game',
    name: 'Test Game',
    gameName: 'Test Game',
    gameTypeName: 'Slots',
    productSupplierName: 'Test Supplier',
    productSupplierId: 0,
    productId: 0,
    productName: 'string',
    demoPlayRestricted: false,
    realPlayRestricted: false,
    maintenanceModeEnabled: false,
    progressiveJackpots: null,
    translations: null,
    gameTypeId: 0,
    parameters: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(GameDetailModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('game', mockGame);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display game name', () => {
    const element: HTMLElement = fixture.nativeElement;
    const title = element.querySelector('h2');
    expect(title?.textContent).toContain('Test Game');
  });

  it('should emit close event on close button click', () => {
    spyOn(component.close, 'emit');
    const element: HTMLElement = fixture.nativeElement;
    const closeButton = element.querySelector('button');
    closeButton?.click();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event on backdrop click', () => {
    spyOn(component.close, 'emit');
    const element: HTMLElement = fixture.nativeElement;
    const backdrop = element.querySelector('.fixed.inset-0');
    (backdrop as HTMLElement)?.click();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
