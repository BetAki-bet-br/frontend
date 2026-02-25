import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '@app/@shared/components/button/button.component';
import { BasicPageContainerComponent } from '@app/@shared/components/basic-page-container/basic-page-container.component';

import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

interface SupportForm {
  email: FormControl<string | null>;
  message: FormControl<string | null>;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonComponent,
    CdnizePipe,
  ],
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
