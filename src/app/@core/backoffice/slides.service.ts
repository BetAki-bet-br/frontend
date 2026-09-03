import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CarouselSlide } from '@app/games-page/components/carousel/carousel';
import { BRAND } from '@app/@core/brand';

@Injectable({
  providedIn: 'root',
})
export class SlidesService {
  private http = inject(HttpClient);
  private readonly brand = inject(BRAND);
  private readonly baseUrl = `${this.brand.api.backofficeApiUrl}/api/v1/carousels`;

  getSlides(slug: string): Observable<CarouselSlide[]> {
    return this.http.get<{ data: CarouselSlide[] }>(`${this.baseUrl}/${slug}`).pipe(
      map((response) =>
        response.data.map((slide) => {
          return slide;
        }),
      ),
    );
  }
}
