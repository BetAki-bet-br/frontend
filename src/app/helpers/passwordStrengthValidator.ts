import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * A regra de senha da tela de cadastro: maiúscula, minúscula, número e um caractere especial.
 *
 * "Especial" é qualquer coisa que não seja letra nem dígito, não uma lista fechada. Era
 * `[@$!%*?&]`, que recusava `Senha#forte1` sem dizer por quê: a mensagem da tela promete "um
 * caractere especial" e nada avisa que `#`, `-` ou `_` não valem. Duas fontes dizem que a lista
 * fechada é que estava errada. `defaultPasswordValidators` (`@shared/form-utils`), usado pela troca
 * de senha e pelo "esqueci minha senha", já aceita `[\W_]`; e o backend da casa não tem regra de
 * classe de caractere nenhuma, só `[MinLength(8)]` em `RegisterRequest` e `ResetPasswordRequest`.
 * Ou seja: a senha que esta tela recusava seria aceita sem reclamação pelas outras duas telas de
 * senha do mesmo produto e guardada pelo backend.
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const hasSpecial = /[\W_]/.test(value);
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    return !passwordValid ? { passwordStrength: true } : null;
  };
}
