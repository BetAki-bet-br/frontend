import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function brazilianMobileValidator(requirePrefix: boolean = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let value = control.value;

    // Allow empty field as valid and skip validation if the control is not dirty
    if (!value || !control.dirty) {
      return null;
    }

    // Regular expression for Brazilian mobile numbers
    const brazilianMobileRegex = requirePrefix
      ? /^\+55\d{2}9\d{8}$/ // With prefix
      : /^\d{2}9\d{8}$/; // Without prefix

    // Check if the value matches the regex
    const isValid = brazilianMobileRegex.test(value);

    // Return validation error if invalid, otherwise null
    return isValid ? null : { invalidBrazilianMobile: true };
  };
}
