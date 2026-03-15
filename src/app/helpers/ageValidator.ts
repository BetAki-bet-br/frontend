import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function parseDateBR(value: string): Date | null {
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year || month > 12 || day > 31) return null;
  return new Date(year, month - 1, day);
}

export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const birthDate = control.value;
    if (!birthDate) {
      return null;
    }

    const birthDateObj = birthDate.includes('/') ? parseDateBR(birthDate) : new Date(birthDate);

    if (!birthDateObj || isNaN(birthDateObj.getTime())) {
      return { underage: true };
    }

    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age >= minAge ? null : { underage: true };
  };
}
