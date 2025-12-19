import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import mustache from 'mustache';

@Pipe({
  name: 'renderTemplate',
})
export class RenderTemplatePipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

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
