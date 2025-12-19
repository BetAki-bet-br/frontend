import { Directive, ElementRef, inject, signal } from '@angular/core';

@Directive({
  selector: '[appDragScroll]',
  standalone: true,
  host: {
    '(mousedown)': 'handleStart($event)',
    '(mouseleave)': 'handleEnd()',
    '(mouseup)': 'handleEnd()',
    '(mousemove)': 'handleMove($event)',
    '(touchstart)': 'handleStart($event)',

    class: 'cursor-grab select-none',
  },
})
export class DragScrollDirective {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private isDragging = signal(false);
  private startX = signal(0);
  private scrollLeft = signal(0);

  handleStart(e: MouseEvent | TouchEvent): void {
    const container = this.elementRef.nativeElement;
    if (e instanceof MouseEvent && e.button !== 0) return;

    this.isDragging.set(true);
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    this.startX.set(clientX);
    this.scrollLeft.set(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.scrollBehavior = 'auto';
  }

  handleMove(e: MouseEvent | TouchEvent): void {
    const container = this.elementRef.nativeElement;
    if (!this.isDragging()) return;
    e.preventDefault();

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const walk = (clientX - this.startX()) * 2;
    container.scrollLeft = this.scrollLeft() - walk;
  }

  handleEnd(): void {
    const container = this.elementRef.nativeElement;
    if (!this.isDragging()) return;

    this.isDragging.set(false);
    container.style.cursor = 'grab';
    container.style.scrollBehavior = 'smooth';
  }
}
