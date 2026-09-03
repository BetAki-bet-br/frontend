import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-basic-page-container',
  templateUrl: './basic-page-container.component.html',
  styleUrls: ['./basic-page-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicPageContainerComponent {
  readonly help = input<string>('');
}
