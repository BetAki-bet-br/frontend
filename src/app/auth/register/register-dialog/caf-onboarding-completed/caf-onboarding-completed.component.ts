// Added CommonModule
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-caf-onboarding-completed',
  templateUrl: './caf-onboarding-completed.component.html',
  styleUrls: ['./caf-onboarding-completed.component.scss'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafOnboardingCompletedComponent {}
