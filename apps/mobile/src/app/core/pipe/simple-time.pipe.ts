import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'simpleTime',
})
export class SimpleTimePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 10) {
      return Math.trunc(value * 10) / 10 + ' ms';
    }
    if (value < 100) {
      return Math.trunc(value) + ' ms';
    }
    if (value < 9999) {
      return Math.trunc(value / 100) / 10 + ' s';
    }
    if (value < 59999) {
      return Math.trunc(value / 1000) + ' s';
    }
    return (
      Math.trunc(value / 60000) +
      ' m' +
      Math.trunc((value % 60000) / 1000) +
      ' s'
    );
  }
}
