import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  errorFormControl = new FormControl();
  errorEmptyValueFormControl = new FormControl();
  errorSelectFormControl = new FormControl();
  dateFormControl = new FormControl(new Date());

  buttonToggleControl = new FormControl();

  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  constructor() {
    this.errorFormControl.setValue('error');
    this.setErrorState(this.errorFormControl);
    this.setErrorState(this.errorEmptyValueFormControl);
    this.setErrorState(this.errorSelectFormControl);
  }

  private setErrorState(control: FormControl): void {
    control.addValidators((control: AbstractControl) => ({ testError: true }));
    control.updateValueAndValidity();
    control.markAsTouched();
  }
}
