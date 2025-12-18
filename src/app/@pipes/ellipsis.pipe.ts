import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string | null | undefined, maxLength: number): string {
    if (value === undefined || value === null) {
      return '';
    }

    if (value.length > maxLength) {
      return value.slice(0, maxLength) + '...';
    }

    return value;
  }
}
