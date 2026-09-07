import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { RenderTemplatePipe } from './render-template.pipe';

describe('RenderTemplatePipe', () => {
  let pipe: RenderTemplatePipe;

  beforeEach(() => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('pt-BR', { Conditions: 'Condições' }, true);
    translate.use('pt-BR');
    pipe = TestBed.inject(RenderTemplatePipe);
  });

  /** O html sai como `SafeHtml`; para conferir o texto basta o que o sanitizer embrulhou. */
  const render = (template: string, content: object) =>
    String((pipe.transform(template, content) as any).changingThisBreaksApplicationSecurity);

  it('preenche o template do CMS com o conteúdo', () => {
    expect(render('<div class="main-title">{{Main title}}</div>', { 'Main title': 'Bônus' })).toContain('Bônus');
  });

  it('traduz o texto marcado com translate, que o innerHTML não compilaria', () => {
    const html = render('<div class="conditions-header" translate>Conditions</div>{{x}}', { x: '' });

    expect(html).toContain('Condições');
    expect(html).not.toContain('Conditions</div>');
  });

  it('deixa como está o texto marcado que não tem tradução', () => {
    expect(render('<span translate>Ativar bônus</span>{{x}}', { x: '' })).toContain('Ativar bônus');
  });
});
