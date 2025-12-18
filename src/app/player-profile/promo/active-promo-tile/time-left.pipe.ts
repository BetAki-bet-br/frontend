import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map, of, repeat } from 'rxjs';

@Pipe({
  name: 'timeLeft',
})
export class TimeLeftPipe implements PipeTransform {
  transform(dateTo: Date, ...args: unknown[]): Observable<string> {
    return of(dateTo).pipe(
      repeat({ delay: 1000 }),
      map(() => {
        return this.getTimeLeft(dateTo);
      })
    );
  }

  private getTimeLeft(dateTo: Date): string {
    const date1 = new Date();
    const date2 = new Date(dateTo);

    const timeDiff = Math.abs(date2.getTime() - date1.getTime());

    const timeDiffInSeconds = Math.floor(timeDiff / 1000);

    const amounts: number[] = [];

    amounts[0] = Math.floor(timeDiffInSeconds / (30 * 24 * 60 * 60));
    amounts[1] = Math.floor((timeDiffInSeconds % (30 * 24 * 60 * 60)) / (24 * 60 * 60));
    amounts[2] = Math.floor((timeDiffInSeconds % (24 * 60 * 60)) / (60 * 60));
    amounts[3] = Math.floor((timeDiffInSeconds % (60 * 60)) / 60);
    amounts[4] = timeDiffInSeconds % 60;

    let resultString = '';
    let skip = false;
    amounts.forEach((amount, index) => {
      if (amount === 0 && !skip) {
        return;
      }
      skip = true;

      resultString += `${amount}${this.getTimePeriod(index)} `;
    });

    return resultString;
  }

  private getTimePeriod(index: number) {
    switch (index) {
      case 0:
        return 'mo';
      case 1:
        return 'd';
      case 2:
        return 'h';
      case 3:
        return 'm';
      case 4:
        return 's';
    }
    return '';
  }
}
