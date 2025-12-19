import { SelectionModel } from '@angular/cdk/collections';
import { Component, DestroyRef, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatBottomSheetModule } from '@angular/material/bottom-sheet'; // Added MatBottomSheetModule
import { MatListOption, MatListModule, MatSelectionListChange } from '@angular/material/list'; // Added MatListModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { CommonModule } from '@angular/common'; // Added CommonModule
import { GameProviderData } from '@app/@shared/models';
import { GameCategory } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, map, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { SupplierNameTransformPipe } from '@app/@pipes/supplier-name-transform.pipe'; // Added SupplierNameTransformPipe
import { UpperCasePipe } from '@angular/common'; // Added UpperCasePipe
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface GameFiltersProvidersDrawerComponentData {
  providersList: GameProviderData[];
  selectedOptions: GameProviderData[];
  isMultiple$: Observable<boolean>;
  isLoading: boolean;
}

export interface GameFiltersProvidersDrawerComponentResult {
  multiselect: boolean;
  selected: GameProviderData[];
}

@Component({
  selector: 'app-game-providers-drawer',
  templateUrl: 'game-filters-providers-drawer.components.html',
  styleUrls: ['./game-filters-providers.component.scss'],
  imports: [
    // Added imports array
    CommonModule,
    MatBottomSheetModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    SupplierNameTransformPipe,
    UpperCasePipe,
  ],
})
export class GameFiltersProvidersDrawerComponent {
  private data = inject<GameFiltersProvidersDrawerComponentData>(MAT_BOTTOM_SHEET_DATA);
  private _bottomSheetRef =
    inject<MatBottomSheetRef<GameFiltersProvidersDrawerComponent, GameFiltersProvidersDrawerComponentResult>>(
      MatBottomSheetRef
    );
  private destroyRef = inject(DestroyRef);
  isMultiple = false;
  menuCategories?: GameCategory[] = [];
  menuCategoriesUrl: string[] = [];

  get providersList(): GameProviderData[] {
    return this.data?.providersList ?? [];
  }

  private selectedOptions: GameProviderData[] = [];

  constructor() {
    const data = this.data;

    this.selectedOptions = [...(data?.selectedOptions ?? [])];
    (data?.isMultiple$ ?? of(false))
      .pipe(
        map((result) => (this.data.isLoading ? false : result)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({ next: (result) => (this.isMultiple = result) });
  }

  onProvidersChange(event: MatSelectionListChange) {
    if (
      event &&
      event.source.selectedOptions &&
      event.source.selectedOptions !== null &&
      event.source.selectedOptions.hasValue()
    ) {
      const selectedIds: string[] = event.source.selectedOptions.selected.map((s) => s.value);
      this.selectedOptions = (this.data?.providersList ?? []).filter((p) =>
        selectedIds.find((t) => t.toString() === p.id.toString())
      );
    } else {
      this.selectedOptions = [];
    }
  }

  confirmFilter(): void {
    this._bottomSheetRef.dismiss({
      multiselect: true,
      selected: this.selectedOptions,
    });
  }

  emitSingleProvider(provider: GameProviderData) {
    // if selected options length > 0 push selected provider
    if (this.selectedOptions && this.selectedOptions !== null && this.selectedOptions.length === 0) {
      this.selectedOptions.push(provider);
    }
    // if selected options already has something, pop last entry and push new
    if (this.selectedOptions && this.selectedOptions !== null && this.selectedOptions.length > 0) {
      this.selectedOptions.pop();
      this.selectedOptions.push(provider);
    }
    this._bottomSheetRef.dismiss({
      multiselect: false,
      selected: this.selectedOptions,
    });
  }

  dismissProvidersDrawer(): void {
    this._bottomSheetRef.dismiss();
  }

  isSelectedProvider(providerId: number) {
    const found: number = this.selectedOptions.findIndex((p) => p.id === providerId);
    return found !== -1 ? true : false;
  }

  isLastProvider(i: number) {
    return i + 1 === this.providersList.length;
  }
}
