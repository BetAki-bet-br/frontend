import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-inline-loading',
  imports: [],
  templateUrl: './inline-loading.html',
  styleUrl: './inline-loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineLoading {}
