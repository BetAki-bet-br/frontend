import { FormControl } from '@angular/forms';
import { passwordStrengthValidator } from './passwordStrengthValidator';

describe('passwordStrengthValidator', () => {
  const validate = (value: string) => passwordStrengthValidator()(new FormControl(value));

  it('aceita qualquer caractere que não seja letra nem dígito como especial', () => {
    for (const password of ['Senha#forte1', 'Senha-forte1', 'Senha_forte1', 'Senha forte1', 'Senha@forte1']) {
      expect(validate(password)).withContext(password).toBeNull();
    }
  });

  it('continua exigindo maiúscula, minúscula, número e especial', () => {
    for (const password of ['senha#forte1', 'SENHA#FORTE1', 'Senha#forte', 'Senhaforte1']) {
      expect(validate(password)).withContext(password).toEqual({ passwordStrength: true });
    }
  });

  it('não opina sobre campo vazio, que é assunto do required', () => {
    expect(validate('')).toBeNull();
  });
});
