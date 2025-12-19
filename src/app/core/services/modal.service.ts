import { Injectable, signal, computed, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState$ = signal<Record<string, boolean>>({});

  open(modalId: string): void {
    this.modalState$.update(state => ({ ...state, [modalId]: true }));
  }

  close(modalId: string): void {
    this.modalState$.update(state => ({ ...state, [modalId]: false }));
  }

  isModalOpen(modalId: string): Signal<boolean> {
    return computed(() => !!this.modalState$()[modalId]);
  }
}
