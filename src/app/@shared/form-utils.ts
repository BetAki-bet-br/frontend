import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export interface BaseSelectOptionType {
  id: number;
  label: string;
}
export interface Gender extends BaseSelectOptionType {}
export interface Country extends BaseSelectOptionType {}
export interface Day extends BaseSelectOptionType {}
export interface Month extends BaseSelectOptionType {}
export interface Year extends BaseSelectOptionType {}
export interface MobileNumberPrefix extends BaseSelectOptionType {
  flag: string;
}

/**
 * Sets the control to an error state, if the parent form group has an error.
 */
export class ParentErrorStateMatcher extends ErrorStateMatcher {
  /**
   *
   * @param parentError the error to check on the parent form group
   */
  constructor(private parentError: string) {
    super();
  }

  override isErrorState(control: AbstractControl<any, any> | null, form: FormGroupDirective | NgForm | null): boolean {
    let isError = super.isErrorState(control, form);

    if (form?.getError(this.parentError)) isError = true;

    return isError;
  }
}

export const defaultPasswordValidators = [
  Validators.required,
  Validators.minLength(8),
  Validators.maxLength(100),
  Validators.pattern(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).*$`),
];

/**
 * Class that validates if two fields are the same value
 * Useful for checking if password and confirm password fields match
 * @param source the source element, example: 'password' <- name of form control
 * @param target the target element, example: 'confirm_password' <- name of form control
 */
export function MatchValidator(source: string, target: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sourceCtrl = control.get(source);
    const targetCtrl = control.get(target);

    if (sourceCtrl && targetCtrl && sourceCtrl.value !== targetCtrl.value) {
      targetCtrl.setErrors({ ...targetCtrl.errors, mismatch: true });
      return { mismatch: true };
    } else {
      targetCtrl?.setErrors(targetCtrl?.errors && !targetCtrl.errors['mismatch'] ? { ...targetCtrl.errors } : null);
      return null;
    }
  };
}

/**
 * Function that returns a form control validator, that checks that the control values are the same.
 * Only returns and error if the control has a value
 * @param controlToCompare the control which value is going to be compared
 * @param errorName the name of the returned error. Default is 'differentValue'
 * @returns
 */
export function getSameValueValidator(
  controlToCompare: FormControl,
  errorName: string = 'differentValue',
): ValidatorFn {
  return (control: AbstractControl) => {
    // If the control has no value, then return no errors
    if (control.value == null || control.value === '') return null;

    const result = control.value === controlToCompare.value ? null : { [errorName]: true };
    return result;
  };
}

/**
 * Function that returns a form control validator, that checks CPF number.
 * @returns
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpfString = control?.value?.replace(/[^0-9]/g, '');
    // Check if CPF contains only numbers
    if (!/^\d+$/.test(cpfString)) {
      return { cpfInvalid: true };
    }

    const cpf = cpfString?.replace(/\D/g, ''); // Remove any non-numeric characters
    if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return { cpfInvalid: true };
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
      return { cpfInvalid: true };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
      return { cpfInvalid: true };
    }

    return null; // Valid CPF
  };
}

/**
 * Checks if control has any other error
 * It return true if it has error and nr of errors equals one
 * @param control
 * @param error
 * @returns
 */
export function controlHasOnlyError(control: FormControl | null, error: string): boolean {
  if (!control) return false;
  const hasError = control.hasError(error);

  const nrOfErrors = Object.keys(control.errors ?? {}).length;

  return hasError && nrOfErrors === 1;
}

export function getMonths(): Month[] {
  const months: Month[] = [];
  for (let i = 1; i <= 12; i++) {
    months.push({ id: i, label: i.toString() });
  }
  return months;
}

export function getDays(year: number, month: number): Day[] {
  const days: Day[] = [];
  for (let i = 1; i < new Date(year, month, 0).getDate() + 1; i++) {
    days.push({ id: i, label: i.toString() });
  }
  return days;
}

export function getYears(): Year[] {
  const years: Year[] = [];
  for (let i = 1900; i < new Date().getFullYear(); i++) {
    years.push({ id: i, label: i.toString() });
  }
  return years;
}

/**
 * Sanitizes a Brazilian mobile phone number by removing the country code and non-numeric characters.
 * @param phoneNumber The phone number to sanitize.
 * @returns The sanitized phone number or null if the input is invalid.
 */
export function sanitizeBrazilianMobilePhoneNumber(phoneNumber: string | null): string | null {
  if (!phoneNumber) return null;

  // Trim leading and trailing spaces, including non-breaking spaces
  phoneNumber = phoneNumber.replace(/\s+/g, '').trim();

  // Remove +55 prefix (with or without spaces) and any non-numeric characters
  const sanitizedNumber = phoneNumber
    .replace(/^\s*[^+\d]*\+55/, '') // remove leading +55 with optional noise before it
    .replace(/\D/g, '');

  return sanitizedNumber;
}
