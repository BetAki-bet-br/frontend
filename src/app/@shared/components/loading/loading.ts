import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrls: ['./loading.scss'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  loadingService = inject(LoadingService);
}
