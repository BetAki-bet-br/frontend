import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

// URLs dos SDKs conforme sua documentação
const OCR_SDK_URL = 'https://cdn.legitimuz.com/js/sdk/legitimuz-sdk.js';
const GEOLOC_SDK_URL = 'https://cdn.legitimuz.com/js/sdk/antifraude.js';
const FACEINDEX_SDK_URL = 'https://cdn.legitimuz.com/js/sdk/faceindex.js';

interface SdkState {
  ocrLoaded: boolean;
  geolocLoaded: boolean;
  faceindexLoaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LegitimuzScriptLoaderService {
  private renderer: Renderer2;
  private state = new BehaviorSubject<SdkState>({
    ocrLoaded: false,
    geolocLoaded: false,
    faceindexLoaded: false,
  });

  /**
   * Observable para componentes saberem quando o SDK de OCR está pronto.
   */
  public ocrSdkLoaded$: Observable<boolean> = this.state.asObservable().pipe(
    map((s) => s.ocrLoaded),
    filter((loaded) => loaded === true),
  );

  /**
   * Observable para componentes saberem quando o SDK de Geoloc está pronto.
   */
  public geolocSdkLoaded$: Observable<boolean> = this.state.asObservable().pipe(
    map((s) => s.geolocLoaded),
    filter((loaded) => loaded === true),
  );

  /**
   * Observable para componentes saberem quando o SDK de FaceIndex está pronto.
   */
  public faceindexSdkLoaded$: Observable<boolean> = this.state.asObservable().pipe(
    map((s) => s.faceindexLoaded),
    filter((loaded) => loaded === true),
  );

  constructor() {
    const rendererFactory = inject(RendererFactory2);

    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Carrega o script do SDK de OCR + Liveness
   */
  public loadOcrSdk(): Promise<void> {
    if (this.state.value.ocrLoaded) {
      return Promise.resolve();
    }
    return this.loadScript('ocr', OCR_SDK_URL);
  }

  /**
   * Carrega o script do SDK de Geoloc Monitoring
   */
  public loadGeolocSdk(): Promise<void> {
    if (this.state.value.geolocLoaded) {
      return Promise.resolve();
    }
    return this.loadScript('geoloc', GEOLOC_SDK_URL);
  }

  /**
   * Carrega o script do SDK de FaceIndex (KYC)
   */
  public loadFaceIndexSdk(): Promise<void> {
    if (this.state.value.faceindexLoaded) {
      return Promise.resolve();
    }
    return this.loadScript('faceindex', FACEINDEX_SDK_URL);
  }

  // Método privado para injetar o script no DOM
  private loadScript(id: 'ocr' | 'geoloc' | 'faceindex', url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.id = `legitimuz-sdk-${id}`;

      script.onload = () => {
        const stateUpdate = {
          ocr: { ocrLoaded: true },
          geoloc: { geolocLoaded: true },
          faceindex: { faceindexLoaded: true },
        };

        this.state.next({
          ...this.state.value,
          ...stateUpdate[id],
        });

        resolve();
      };

      script.onerror = (error: Event) => {
        console.error(`Legitimuz: Falha ao carregar script ${id}`, error);
        reject(error);
      };

      this.renderer.appendChild(document.body, script);
    });
  }
}
