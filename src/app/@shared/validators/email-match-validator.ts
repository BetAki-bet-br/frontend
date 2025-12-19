import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class EmailMatchValidator {
  static matchEmails(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.get('email');
      const confirmEmail = control.get('confirmEmail');

      // Return null if controls haven't initialised yet
      if (!email || !confirmEmail) {
        return null;
      }

      // Return null if another validator has already found an error on the matchingControl
      if (confirmEmail.errors && !confirmEmail.errors['emailMismatch']) {
        return null;
      }

      // Return error if validation fails
      return email.value === confirmEmail.value ? null : { emailMismatch: true };
    };
  }
}
