import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTrimInput]',
})
export class TrimInputDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput() {
    const input = this.el.nativeElement;
    input.value = input.value.replace(/\s/g, '');
  }
}
