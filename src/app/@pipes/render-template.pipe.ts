import { Pipe, PipeTransform, inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import mustache from 'mustache';

@Pipe({
  name: 'renderTemplate',
})
@Injectable({
  providedIn: 'root',
})
export class RenderTemplatePipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);

  transform(template: string, content: any): SafeHtml {
    // const findings = template.match(/\(([^)]*)\)[^(]*$/);
    // console.log('RenderTemplatePipe', findings);

    if (template && content) {
      return this._sanitizer.bypassSecurityTrustHtml(mustache.render(template, content));
    } else {
      return '';
    }
  }
}
