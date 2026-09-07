import { Pipe, PipeTransform, inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import mustache from 'mustache';

/** Elemento que o template do CMS marcou com `translate`. */
const MARKED_ELEMENTS = '[translate]';

/** Barato o bastante para rodar em todo template, e poupa o passeio pelo DOM de quem não precisa. */
const HAS_MARKED_ELEMENT = /\stranslate(\s|=|>)/;

@Pipe({
  name: 'renderTemplate',
})
@Injectable({
  providedIn: 'root',
})
export class RenderTemplatePipe implements PipeTransform {
  private _sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  transform(template: string, content: any): SafeHtml {
    // const findings = template.match(/\(([^)]*)\)[^(]*$/);
    // console.log('RenderTemplatePipe', findings);

    if (template && content) {
      return this._sanitizer.bypassSecurityTrustHtml(this.translateMarked(mustache.render(template, content)));
    } else {
      return '';
    }
  }

  /**
   * Traduz o texto dos nós que o template do CMS marcou com `translate`.
   *
   * O html do CMS entra na tela por `[innerHTML]`, que não compila diretiva nenhuma: o `translate`
   * do template 19 (`<div class="conditions-header" translate>Conditions</div>`) era decoração, e o
   * jogador brasileiro lia "Conditions" em inglês. Como o texto marcado é literal, dá para traduzir
   * aqui, antes de o html virar `SafeHtml`.
   *
   * Só o nó cujo conteúdo é texto puro é tocado, e só quando existe tradução: sem chave,
   * `instant()` devolve a própria frase e o template fica como o CMS escreveu.
   */
  private translateMarked(html: string): string {
    if (!HAS_MARKED_ELEMENT.test(html)) {
      return html;
    }

    const root = document.createElement('div');
    root.innerHTML = html;

    for (const element of Array.from(root.querySelectorAll(MARKED_ELEMENTS))) {
      if (element.children.length > 0) continue;

      const text = element.textContent?.trim();
      if (!text) continue;

      const translated = this.translate.instant(text);
      if (translated && translated !== text) {
        element.textContent = translated;
      }
    }

    return root.innerHTML;
  }
}
