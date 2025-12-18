import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-basic-page-container',
  templateUrl: './basic-page-container.component.html',
  styleUrls: ['./basic-page-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicPageContainerComponent {
  private renderer = inject(Renderer2);

  @Input() help: string = '';
}
