import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ghost-color-layer',
  imports: [],
  templateUrl: './ghost-color-layer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './ghost-color-layer.scss',
})
export class GhostColorLayer {}
