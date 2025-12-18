import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface SupportForm {
  email: FormControl<string | null>;
  message: FormControl<string | null>;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportComponent {
  supportForm: FormGroup<SupportForm> = new FormGroup({
    email: new FormControl(''),
    message: new FormControl(''),
  });

  sendContactFormHandler() {
    const email = this.supportForm.get('email')?.value;
    const message = this.supportForm.get('message')?.value;
    this.supportForm.controls.email.setValidators([Validators.required, Validators.email]);
    this.supportForm.controls.email.updateValueAndValidity();
    this.supportForm.controls.message.setValidators([Validators.required]);
    this.supportForm.controls.message.updateValueAndValidity();
    this.supportForm.controls.email.clearValidators();
    this.supportForm.controls.message.clearValidators();
  }
}
