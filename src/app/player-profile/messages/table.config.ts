import { TemplateRef } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export function getTableColumns(arrowTemplate: TemplateRef<any> | undefined) {
  return [
    {
      name: marker('Title'),
      dataField: 'title',
      sortingField: 'title',
      columnTemplate: arrowTemplate,
    },
  ];
}
