import { SafeHtml } from '@angular/platform-browser';

export interface Banner {
  name?: string;
  title?: string;
  template: string;
  content: { [key: string]: any };
  templateHtml?: SafeHtml | null;
}
