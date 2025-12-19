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
}

// Necessário para o TypeScript tratar este arquivo como um módulo
export {};
