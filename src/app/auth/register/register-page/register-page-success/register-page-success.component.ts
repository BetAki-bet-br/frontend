import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-register-page-success',
  templateUrl: './register-page-success.component.html',
  styleUrls: ['./register-page-success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageSuccessComponent {
  @Output() verify = new EventEmitter<void>();
}
