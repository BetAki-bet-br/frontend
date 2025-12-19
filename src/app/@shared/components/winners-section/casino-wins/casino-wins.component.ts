import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { WinnersItemResolved } from '@app/@shared/models';
import { CredentialsService } from '@app/auth/credentials.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, Observable, switchMap } from 'rxjs';
import { TableColumn } from '../../base-table/base-table.component';
import { getDesktopTableColumns, getMobileTableColumns } from './table.config';

@UntilDestroy()
@Component({
  selector: 'app-casino-wins',
  templateUrl: './casino-wins.component.html',
  styleUrls: ['./casino-wins.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasinoWinsComponent implements OnInit {
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

  constructor(
    public dataStoreService: DataStoreService,
    private credentialService: CredentialsService,
    private configurationService: ConfigurationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tableColumnsDesktop = getDesktopTableColumns(this.usernameTemplate, this.currencyTemplate);
    this.tableColumnsMobile = getMobileTableColumns(
      this.gameUsernameTemplate,
      this.betAmountMultiplierTemplate,
      this.currencyTemplate
    );

    this.credentialService.isAuthenticated$
      .pipe(
        untilDestroyed(this),
        filter((isAuth) => isAuth === true),
        switchMap(() => {
          return this.configurationService.getPlayerInfo();
        })
      )
      .subscribe((playerInfo) => {
        this.playerCurrency = playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency;
      });

    this.loadData();
  }

  private loadData() {
    this.latestWinners$?.pipe(untilDestroyed(this)).subscribe({
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
