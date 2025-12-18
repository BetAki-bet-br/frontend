import { Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

interface DOMRectI {
  bottom: number;
  height: number;
  left: number; // position start of element
  right: number; // position end of element
  top: number;
  width: number; // width of element
  x?: number;
  y?: number;
}

@Directive({
  selector: '[appScrollToCenter]',
})
export class MatTabScrollToCenterDirective implements OnDestroy {
  private element = inject(ElementRef);

  subs = new Subscription();

  constructor() {
    this.subs.add(
      fromEvent(this.element.nativeElement, 'click').subscribe((clickedContainer) => {
        const scrollContainer = this.element.nativeElement.querySelector('.mat-mdc-tab-list');
        const currentScrolledContainerPosition: number = scrollContainer.scrollLeft;
        const newPositionScrollTo = this.calcScrollToCenterValue(
          clickedContainer as MouseEvent,
          currentScrolledContainerPosition
        );

        scrollContainer.scroll({
          left: newPositionScrollTo,
          behavior: 'smooth',
        });
      })
    );
  }

  calcScrollToCenterValue(clickedContainer: MouseEvent, currentScrolledContainerPosition: number): number {
    const scrolledButton: DOMRectI = (clickedContainer.target as HTMLElement).getBoundingClientRect();
    const leftXOffset = (window.innerWidth - scrolledButton.width) / 2;
    const currentVisibleViewportLeft = scrolledButton.left;
    const neededLeftOffset = currentVisibleViewportLeft - leftXOffset;
    const newValueToSCroll = currentScrolledContainerPosition + neededLeftOffset;
    return newValueToSCroll;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
