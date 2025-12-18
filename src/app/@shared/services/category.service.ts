import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError, shareReplay } from 'rxjs';
import {
  GameCategory as ApiGameCategory,
  GameCategoriesResponse as ApiGameCategoriesResponse,
  ProdGameService,
  GameCategory,
} from '@icore/ngx-portalgateway-api-client-atl';

function toLocalGameCategory(apiCategory: ApiGameCategory): GameCategory {
  const categoryTypeId = apiCategory.categoryTypeId ? parseInt(apiCategory.categoryTypeId, 10) : NaN;
  return {
    id: apiCategory.id ?? 0,
    name: apiCategory.name ?? '',
    parentId: apiCategory.parentId ?? null,
    categoryTypeId: isNaN(categoryTypeId) ? '0' : String(categoryTypeId),
    // subLevels: [], // Initialized as empty, assumed to be populated by consumers.
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private prodGameService = inject(ProdGameService);

  private categoriesCache: Record<string, Observable<GameCategory[]>> = {};

  public getGameCategories(portalId: number): Observable<GameCategory[]> {
    const cacheKey = `${portalId}`;
    if (!this.categoriesCache[cacheKey]) {
      this.categoriesCache[cacheKey] = this.prodGameService.apiPortalV1ProdGameGameCategoriesPortalIdGet(portalId).pipe(
        map((data: ApiGameCategoriesResponse) => {
          if (!data || !data.gameCategoryList || !Array.isArray(data.gameCategoryList)) {
            return [];
          }
          return data.gameCategoryList.map(toLocalGameCategory);
        }),
        catchError(() => of([])),
        shareReplay(1)
      );
    }
    return this.categoriesCache[cacheKey];
  }
}
