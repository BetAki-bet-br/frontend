import { Directive, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appTrimInput]',
})
export class TrimInputDirective {
  private el = inject(ElementRef);

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    input.value = input.value.replace(/\s/g, '');
  }
}
