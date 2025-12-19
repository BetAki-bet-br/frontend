/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  [key: string]: any;

  id: string;
}

interface Window {
  [key: string]: any;
}

export interface LegitimuzFaceIndexData {
  id?: string;
  status?: string;
  result?: unknown;
  [key: string]: unknown;
}

export interface LegitimuzError {
  code?: string | number;
  message?: string;
  details?: unknown;
  [key: string]: unknown;
}

declare global {
  interface Window {
    /**
     * SDK OCR + Liveness
     * (legitimuz-sdk.js)
     */
    Legitimuz: (options: {
      host: string;
      token: string;
      lang?: 'pt' | 'en' | 'es';
      enableRedirect?: boolean;
      autoOpenValidation?: boolean;
      balanceValue?: number | string;
      withdrawValue?: number | string;
      onSuccess?: (eventName: 'ocr' | 'facematch') => void;
      onError?: (eventName: 'ocr' | 'facematch') => void;
    }) => {
      mount: () => void;
    };

    /**
     * SDK Face Index (KYC)
     * (faceindex.js)
     */
    LegitimuzFaceIndex: (options: {
      host: string;
      apiURL: string;
      appURL: string;
      token: string;
      onSuccess?: (data: LegitimuzFaceIndexData) => void;
      onError?: (error: LegitimuzError) => void;
    }) => {
      mount: () => void;
    };

    Tawk_API?: {
      maximize: () => void;
      onLoad: () => void;
    };
    Tawk_LoadStart: Date;
  }

  /**
   * SDK Tawk.to API
   */
  interface TawkAPI {
    maximize(): void;
    minimize(): void;
    showWidget(): void;
    hideWidget(): void;
    endChat(): void;
    setAttributes(attributes: { name: string; email: string }, callback: (error: string | undefined) => void): void;
  }
}
