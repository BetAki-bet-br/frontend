import { Directive, ElementRef, inject, input, afterNextRender, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
  host: {
    '[src]': 'loadedUrl()',
    '[class.loading]': 'loading()',
  },
})
export class LazyLoadImageDirective {
  lazyLoad = input.required<string>(); // The image URL

  private el = inject(ElementRef<HTMLImageElement>);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  loading = signal(true);
  loadedUrl = signal<SafeUrl | string>(
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  );

  constructor() {
    afterNextRender(() => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
            intersectionObserver.unobserve(this.el.nativeElement);
          }
        });
      });
      intersectionObserver.observe(this.el.nativeElement);
    });
  }

  private async loadImage(): Promise<void> {
    if (!this.lazyLoad()) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);

    try {
      const blob = await firstValueFrom(this.http.get(this.lazyLoad(), { responseType: 'blob' }));
      const objectUrl = URL.createObjectURL(blob);
      this.loadedUrl.set(this.sanitizer.bypassSecurityTrustUrl(objectUrl));
    } catch (error) {
      // Handle error, maybe set a fallback image
      console.error('Failed to load image', this.lazyLoad(), error);
      // Keep the placeholder or set a broken image indicator
    } finally {
      this.loading.set(false);
    }
  }
}
