import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
// Added CommonModule
import { TranslateModule } from '@ngx-translate/core'; // Added TranslateModule
import { MatButtonModule } from '@angular/material/button'; // Added MatButtonModule
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { CdnizePipe } from '@app/@pipes/cdnize.pipe'; // Added CdnizePipe

@Component({
  selector: 'app-register-page-success',
  templateUrl: './register-page-success.component.html',
  styleUrls: ['./register-page-success.component.scss'],
  imports: [TranslateModule, MatButtonModule, MatIconModule, CdnizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageSuccessComponent {
  @Output() verify = new EventEmitter<void>();
}
