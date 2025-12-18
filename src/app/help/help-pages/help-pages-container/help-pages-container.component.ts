import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-pages-container',
  templateUrl: './help-pages-container.component.html',
  styleUrls: ['./help-pages-container.component.scss'],
  imports: [CommonModule],
})
export class HelpPagesContainerComponent {
  @Input() customClassName: string = '';
}
