import { ChangeDetectionStrategy, Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Provider } from '@app/games-page/models/game.models';

@Component({
  selector: 'app-game-filter-modal',
  templateUrl: './game-filter-modal.html',
  styleUrls: ['./game-filter-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameFilterModal {
  isOpen = input<boolean>(false);
  providers = input<Provider[]>([]);
  // Seleção inicial vinda da página (para pré-selecionar checkboxes ao abrir)
  initialSelectedProviders = input<Provider[]>([]);
  closeModal = output<void>();
  filtersApplied = output<{ providers: Provider[] }>();

  selectedProviders = signal<Provider[]>([]);

  // Ao abrir o modal, inicializa a seleção com a seleção atual da página
  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const initial = this.initialSelectedProviders();
        this.selectedProviders.set(initial ? initial.slice() : []);
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  toggleProvider(provider: Provider): void {
    this.selectedProviders.update((providers) => {
      if (providers.includes(provider)) {
        return providers.filter((p) => p !== provider);
      } else {
        return [...providers, provider];
      }
    });
  }

  applyFilters(): void {
    this.filtersApplied.emit({ providers: this.selectedProviders() });
    this.onClose();
  }

  clearSelection(): void {
    this.selectedProviders.set([]);
  }

  clearAndApply(): void {
    this.selectedProviders.set([]);
    this.filtersApplied.emit({ providers: [] });
    this.onClose();
  }
}
