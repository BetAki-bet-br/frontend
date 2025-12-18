import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-basic-page-container',
  templateUrl: './basic-page-container.component.html',
  styleUrls: ['./basic-page-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicPageContainerComponent {
  @Input() help: string = '';

  constructor(private renderer: Renderer2) {}
}
