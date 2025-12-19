import { isPlatformBrowser } from '@angular/common';
import { Injectable, DOCUMENT, PLATFORM_ID, inject } from '@angular/core';
import { Observable, of, defer, catchError, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DynamicScriptLoaderService {
  private doc = inject<Document>(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private readonly loadedScripts = new Map<string, Observable<boolean>>();
  loadScript(src: string, place: 'head' | 'body' = 'head', label = ''): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) return of(false);
    if (this.loadedScripts.has(src)) return this.loadedScripts.get(src)!;
    const script$ = defer(() => {
      if (this.doc.querySelector(`script[src="${src}"]`)) return of(true);
      return new Observable<boolean>((observer) => {
        const script = this.doc.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
          console.log(`[${label}] Script loaded.`);
          observer.next(true);
          observer.complete();
        };
        script.onerror = () => {
          console.error(`[${label}] Failed to load script: ${src}`);
          observer.error(new Error(`Failed to load: ${src}`));
        };
        this.doc[place].appendChild(script);
      });
    }).pipe(
      catchError(() => {
        this.loadedScripts.delete(src);
        return of(false);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.loadedScripts.set(src, script$);
    return script$;
  }
}
