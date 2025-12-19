import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-welcome-message',
  templateUrl: './welcome-message.component.html',
  styleUrls: ['./welcome-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeMessageComponent {
  showReadMore = true;
}
