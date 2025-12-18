import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirm-password')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };
}
