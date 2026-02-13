import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-basic-page-container',
  templateUrl: './basic-page-container.component.html',
  styleUrls: ['./basic-page-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicPageContainerComponent {
  @Input() help: string = '';
}
