import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-help-pages-container',
  templateUrl: './help-pages-container.component.html',
  styleUrls: ['./help-pages-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPagesContainerComponent {
  readonly customClassName = input<string>('');
}
