import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from './button.component';

/**
 * O `disabled` de um formulário reativo, num app sem zone.
 *
 * A suspeita das ondas anteriores era que `[disabled]="form.invalid"` num componente `OnPush` não
 * repintasse quando o formulário virasse válido, porque `form.invalid` não é signal. Não é o caso, e
 * estes testes existem para segurar isso: o value accessor do `formControlName` é um listener de
 * template, e um listener marca a view e toda a cadeia de pais como suja, então a expressão é
 * reavaliada. Nenhum `detectChanges()` na mão aqui de propósito; só `whenStable()`.
 */
@Component({
  selector: 'app-disabled-probe',
  imports: [ReactiveFormsModule, ButtonComponent, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form">
      <input id="plain" formControlName="plain" />
      <mat-form-field>
        <input matInput id="material" formControlName="material" />
      </mat-form-field>
      <app-button type="submit" [disabled]="form.invalid">Enviar</app-button>
      <button id="native" type="submit" [disabled]="form.invalid">Enviar</button>
    </form>
  `,
})
class DisabledProbeComponent {
  readonly form = new FormGroup({
    plain: new FormControl('', Validators.required),
    material: new FormControl('', Validators.required),
  });
}

describe('ButtonComponent, disabled ligado a um formulário reativo', () => {
  async function setUp() {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(DisabledProbeComponent);
    await fixture.whenStable();
    return fixture;
  }

  /** Digitação de verdade: o mesmo evento que o browser dispara. */
  function type(fixture: { nativeElement: HTMLElement }, id: string, value: string) {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('desabilita enquanto o formulário está inválido', async () => {
    const fixture = await setUp();

    expect(fixture.componentInstance.form.invalid).toBeTrue();
    expect((fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('habilita sozinho quando o formulário fica válido, sem detecção na mão', async () => {
    const fixture = await setUp();

    type(fixture, 'plain', 'Ana');
    type(fixture, 'material', 'Souza');
    await fixture.whenStable();

    expect(fixture.componentInstance.form.valid).toBeTrue();
    expect((fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).disabled).toBeFalse();
    expect((fixture.nativeElement.querySelector('#native') as HTMLButtonElement).disabled).toBeFalse();
  });

  it('volta a desabilitar quando o formulário perde a validade', async () => {
    const fixture = await setUp();

    type(fixture, 'plain', 'Ana');
    type(fixture, 'material', 'Souza');
    await fixture.whenStable();
    type(fixture, 'plain', '');
    await fixture.whenStable();

    expect((fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).disabled).toBeTrue();
  });
});
