import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { animate, state, style, transition, trigger } from '@angular/animations'; // Added animation imports
import { TableColumn, TableConfig, GenericDataModel } from '../base-table/base-table.component'; // Imported types

@Component({
  selector: 'app-base-table-msgs',
  templateUrl: './base-table-msgs.component.html',
  styleUrls: ['./base-table-msgs.component.scss'],
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTableMsgsComponent<T> implements OnChanges, AfterViewInit {
  readonly tableColumns = input<TableColumn[]>();
  readonly tableData = input<T[]>();
  readonly tableConfig = input<TableConfig>();
  readonly noRecordsText = input<string>(marker('No transactions'));
  readonly displayPaginator = input<boolean | undefined>(false);
  readonly pageSize = input<number | undefined>(2);
  readonly expandEnabled = input(true);

  readonly rowExtended = output<GenericDataModel<T>>();

  @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
    //this.dataSource.sortingDataAccessor = this.customSortingDataAccessor;
  }

  readonly paginator = viewChild(MatPaginator);

  displayedColumns: string[] = [];
  columnsToDisplayWithExpand = [...this.displayedColumns];
  dataSource = new MatTableDataSource<GenericDataModel<T>>([]);
  paginatorVisibility = false;

  ngOnChanges(changes: SimpleChanges): void {
    const tableColumns = this.tableColumns();
    if (changes['tableColumns'] && tableColumns) {
      for (let column of tableColumns) {
        this.displayedColumns.push(column.name);
      }

      if (this.EnableExpandableRows) {
        this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
      } else {
        this.columnsToDisplayWithExpand = [...this.displayedColumns];
      }
    }

    const tableData = this.tableData();
    if (changes['tableData'] && tableData) {
      const tableDataMapped = tableData.map((o) => {
        return {
          isExpanded: false,
          ...o,
        };
      });
      this.dataSource.data = [...tableDataMapped];
    }

    this.paginatorVisibility = tableData?.length ? (this.displayPaginator() ?? false) : false;
  }

  ngAfterViewInit() {
    const paginator = this.paginator();
    if (this.displayPaginator() && this.dataSource && paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  get HideHeader() {
    return !!this.tableConfig()?.hideHeader;
  }

  get DisableSort() {
    return !!this.tableConfig()?.disableSort;
  }

  get EnableExpandableRows() {
    return !!this.tableConfig()?.enableExpandableRows;
  }

  get ExpandableRowTemplate() {
    return this.tableConfig()?.expandableRowTemplate ?? null;
  }

  /*
  private customSortingDataAccessor = (data: GenericDataModel<T>, sortHeaderId: string) => {
    let value = data[sortHeaderId];

    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    } else {
      return value;
    }
  };
  */

  expandElement(element: GenericDataModel<T>) {
    if (!this.expandEnabled()) return;

    if (element) {
      element.isExpanded = !element.isExpanded;
      this.rowExtended.emit(element);
    }
  }

  deleteSelected() {}
}
