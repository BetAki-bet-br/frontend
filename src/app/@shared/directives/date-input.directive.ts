import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appDateAutoFormat]',
})
export class DateAutoFormatDirective {
  private el = inject(ElementRef);

  private previousValue = '';

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-numeric characters

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 2);
    }
    if (value.length > 2) {
      formatted += '/' + value.substring(2, 4);
    }
    if (value.length > 4) {
      formatted += '/' + value.substring(4, 8);
    }

    input.value = formatted;
    this.previousValue = formatted;
  }
}
