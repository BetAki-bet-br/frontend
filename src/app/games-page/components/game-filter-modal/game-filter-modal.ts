import { ChangeDetectionStrategy, Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Provider } from '@app/games-page/models/game.models';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-game-filter-modal',
  imports: [CommonModule, MatCheckboxModule],
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

  isSelected(provider: Provider): boolean {
    return this.selectedProviders().some(p => p.id === provider.id);
  }

  toggleProvider(provider: Provider): void {
    this.selectedProviders.update((providers) => {
      const isSelected = providers.some(p => p.id === provider.id);
      if (isSelected) {
        return providers.filter((p) => p.id !== provider.id);
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