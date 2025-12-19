import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-password-strength-indicator',
  templateUrl: './password-strength-indicator.component.html',
  styleUrls: ['./password-strength-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
})
export class PasswordStrengthIndicatorComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  @Input() matInput?: MatInput;
  @Input() customAdditionalWidth?: number;

  control?: FormControl;
  passwordStrengthIndex?: number;
  strengthLabel?: string;

  ngOnInit(): void {
    this.control = this.matInput?.ngControl.control as FormControl;
    this.control?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateValues();
    });
  }

  private updateValues() {
    const passwordStrength = this.getPasswordStrength();

    if (passwordStrength === 0) {
      this.passwordStrengthIndex = 0;
      this.strengthLabel = '';
    } else if (passwordStrength <= 10) {
      this.passwordStrengthIndex = 1;
      this.strengthLabel = marker('awful');
    } else if (passwordStrength <= 20) {
      this.passwordStrengthIndex = 2;
      this.strengthLabel = marker('weak');
    } else if (passwordStrength <= 30) {
      this.passwordStrengthIndex = 3;
      this.strengthLabel = marker('strong');
    } else if (passwordStrength <= 40) {
      this.passwordStrengthIndex = 4;
      this.strengthLabel = marker('perfect');
    } else {
      this.passwordStrengthIndex = 4;
      this.strengthLabel = '';
    }

    this.cdr.markForCheck();
  }

  /**
   * Checks strength of password by 5 criteria (length, lower | upper letters, numbers and symbols)
   * @param password need to check strength of this string
   */
  private getPasswordStrength(): number {
    const password = this.control?.value;
    let strength = 0;

    if (!password) {
      return 0;
    }

    // regex for lower | upper letters, numbers and symbols checks
    const lowerLetters: boolean = /[a-z]+/.test(password);
    const upperLetters: boolean = /[A-Z]+/.test(password);
    const numbers: boolean = /[0-9]+/.test(password);
    const symbols: boolean = /[!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?`~]+/.test(password);

    const checksList: boolean[] = [lowerLetters, upperLetters, numbers, symbols];

    // get number of passed checks
    let passedChecks = 0;
    for (const check of checksList) {
      passedChecks += check ? 1 : 0;
    }

    // calculate strength
    strength += 2 * password.length + (password.length >= 10 ? 1 : 0);
    strength += passedChecks * 10;

    // short password
    strength = password.length <= 6 ? Math.min(strength, 10) : strength;

    // poor variety of characters
    strength = passedChecks === 1 ? Math.min(strength, 10) : strength;
    strength = passedChecks === 2 ? Math.min(strength, 20) : strength;
    strength = passedChecks === 3 ? Math.min(strength, 30) : strength;
    strength = passedChecks === 4 ? Math.min(strength, 40) : strength;

    return strength;
  }
}
