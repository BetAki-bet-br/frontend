import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CarouselSlide } from '@app/games-page/components/carousel/carousel';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class SlidesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backofficeApiUrl}/api/v1/carousels`;

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
