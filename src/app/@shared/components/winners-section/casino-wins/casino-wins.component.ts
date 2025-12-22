import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { WinnersItemResolved } from '@app/@shared/models';
import { CredentialsService } from '@app/auth/credentials.service';
import { filter, Observable, switchMap } from 'rxjs';
import { TableColumn, BaseTableComponent } from '../../base-table/base-table.component';
import { getDesktopTableColumns, getMobileTableColumns } from './table.config';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-casino-wins',
  templateUrl: './casino-wins.component.html',
  styleUrls: ['./casino-wins.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTableComponent, TranslateModule, DecimalPipe],
})
export class CasinoWinsComponent implements OnInit {
  dataStoreService = inject(DataStoreService);
  private credentialService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  @ViewChild('currencyTemplate', { static: true }) currencyTemplate?: TemplateRef<any>;
  @ViewChild('usernameTemplate', { static: true }) usernameTemplate?: TemplateRef<any>;
  @ViewChild('gameUsernameTemplate', { static: true }) gameUsernameTemplate?: TemplateRef<any>;
  @ViewChild('betAmountMultiplierTemplate', { static: true }) betAmountMultiplierTemplate?: TemplateRef<any>;

  @Input()
  latestWinners$!: Observable<WinnersItemResolved[]>;

  tableColumnsDesktop: TableColumn[] = [];
  tableColumnsMobile: TableColumn[] = [];

  tableData: WinnersItemResolved[] = [];
  isDataLoading = false;
  playerCurrency: string | undefined = this.dataStoreService.defaultCurrency;

  ngOnInit(): void {
    this.tableColumnsDesktop = getDesktopTableColumns(this.usernameTemplate, this.currencyTemplate);
    this.tableColumnsMobile = getMobileTableColumns(
      this.gameUsernameTemplate,
      this.betAmountMultiplierTemplate,
      this.currencyTemplate,
    );

    this.credentialService.isAuthenticated$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((isAuth) => isAuth === true),
        switchMap(() => {
          return this.configurationService.getPlayerInfo();
        }),
      )
      .subscribe((playerInfo) => {
        this.playerCurrency = playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency;
      });

    this.loadData();
  }

  private loadData() {
    this.latestWinners$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data && data !== null && data.length > 0) {
          this.tableData = [...data];
        } else {
          this.tableData = [] as any;
        }
        this.isDataLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isDataLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
