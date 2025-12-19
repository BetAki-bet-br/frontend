import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListOption } from '@angular/material/list';
import { GameProviderData } from '@app/@shared/models';
import { GameCategory } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, map, of } from 'rxjs';

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

@UntilDestroy()
@Component({
  selector: 'app-game-providers-drawer',
  templateUrl: 'game-filters-providers-drawer.components.html',
  styleUrls: ['./game-filters-providers.component.scss'],
})
export class GameFiltersProvidersDrawerComponent {
  isMultiple = false;
  menuCategories?: GameCategory[] = [];
  menuCategoriesUrl: string[] = [];

  get providersList(): GameProviderData[] {
    return this.data?.providersList ?? [];
  }

  private selectedOptions: GameProviderData[] = [];

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private data: GameFiltersProvidersDrawerComponentData,
    private _bottomSheetRef: MatBottomSheetRef<
      GameFiltersProvidersDrawerComponent,
      GameFiltersProvidersDrawerComponentResult
    >
  ) {
    this.selectedOptions = [...(data?.selectedOptions ?? [])];
    (data?.isMultiple$ ?? of(false))
      .pipe(
        map((result) => (this.data.isLoading ? false : result)),
        untilDestroyed(this)
      )
      .subscribe({ next: (result) => (this.isMultiple = result) });
  }

  onProvidersChange(model: SelectionModel<MatListOption>) {
    if (model && model.selected && model.selected !== null && model.selected.length > 0) {
      const selectedIds: string[] = model.selected.map((s) => s.value);
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
