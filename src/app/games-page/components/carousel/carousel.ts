import { NgOptimizedImage, NgStyle, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  input,
  signal,
} from '@angular/core';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';

export interface CarouselSlide {
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  imageUrl: string;
  alt: string;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, CdnizePipe],
  host: {
    '(window:resize)': 'onResize()',
    '(mouseenter)': 'pauseAutoPlay()',
    '(mouseleave)': 'onMouseLeave($event)',
    '(mousedown)': 'handleStart($event)',
    '(mouseup)': 'handleEnd($event)',
    '(mousemove)': 'handleMove($event)',
    '(touchstart)': 'handleStart($event)',
    '(touchmove)': 'handleMove($event)',
    '(touchend)': 'handleEnd($event)',
  },
})
export class CarouselComponent implements OnInit, OnDestroy, OnChanges {
  slides = input<CarouselSlide[]>([]);
  autoPlayInterval = input(3500);
  maxWidth = input('');
  class = input('');

  currentIndex = signal(0);

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;
  isDragging = signal(false);
  private startX = signal(0);
  private readonly threshold = 50;

  loadedImages = signal<Set<number>>(new Set());

  private readonly platformId = inject(PLATFORM_ID);
  private isSmallScreen = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen.set(window.innerWidth < 1024);
    }
  }

  ngOnInit(): void {
    if (this.slides() && this.slides().length > 1) {
      this.currentIndex.set(Math.floor(this.slides().length / 2));
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.pauseAutoPlay();
  }

  ngOnChanges(): void {
    this.loadedImages.set(new Set());
    this.currentIndex.set(this.slides().length > 0 ? Math.floor(this.slides().length / 2) : 0);
    this.resumeAutoPlay();
  }

  onImageLoad(index: number): void {
    this.loadedImages.update((set) => {
      const newSet = new Set(set);
      newSet.add(index);
      return newSet;
    });
  }

  isImageLoaded(index: number): boolean {
    return this.loadedImages().has(index);
  }

  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isSmallScreen.set(window.innerWidth < 1024);
    }
  }

  getSlideStyle(i: number): Record<string, string | number> {
    const n = this.slides().length;
    let offset = i - this.currentIndex();

    if (n > 2 && Math.abs(offset) > n / 2) {
      offset = offset > 0 ? offset - n : offset + n;
    }

    const absOffset = Math.abs(offset);

    const style: Record<string, string | number> = {
      transition: 'transform 500ms ease-in-out, filter 500ms ease-in-out, opacity 500ms ease-in-out',
      zIndex: this.slides().length - absOffset,
    };

    if (this.isSmallScreen()) {
      style['transform'] = `translateX(${offset * 100}%)`;
      style['filter'] = 'blur(0)';
      style['opacity'] = absOffset === 0 ? 1 : 0;
    } else {
      if (offset === 0) {
        // Center slide
        style['transform'] = 'translateX(0) scale(0.75)'; // Smaller main card
        style['filter'] = 'blur(0)';
        style['opacity'] = 1;
      } else if (offset === -1) {
        // Previous slide
        style['transform'] = 'translateX(-40%) scale(0.6)';
        style['filter'] = 'blur(3px)';
        style['opacity'] = 0.6;
      } else if (offset === 1) {
        // Next slide
        style['transform'] = 'translateX(40%) scale(0.6)';
        style['filter'] = 'blur(3px)';
        style['opacity'] = 0.6;
      } else {
        // Other slides
        style['transform'] = `translateX(${Math.sign(offset) * 50}%) scale(0.5)`;
        style['filter'] = 'blur(5px)';
        style['opacity'] = 0;
      }
    }

    return style;
  }

  startAutoPlay(): void {
    this.pauseAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval());
  }

  pauseAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resumeAutoPlay(): void {
    if (this.slides() && this.slides().length > 1) {
      this.startAutoPlay();
    }
  }

  nextSlide(): void {
    this.currentIndex.update((current) => (current + 1) % this.slides().length);
  }

  prevSlide(): void {
    this.currentIndex.update((current) => (current === 0 ? this.slides().length - 1 : current - 1));
  }

  onMouseLeave(e: MouseEvent): void {
    if (this.isDragging()) {
      this.handleEnd(e);
    } else {
      this.resumeAutoPlay();
    }
  }

  handleStart(e: MouseEvent | TouchEvent): void {
    if (e instanceof MouseEvent && e.button !== 0) {
      return; // Only allow main mouse button drags
    }
    this.isDragging.set(true);
    this.startX.set(e instanceof MouseEvent ? e.clientX : e.touches[0].clientX);
    this.pauseAutoPlay();
  }

  handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging()) return;
    e.preventDefault();
  }

  handleEnd(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging()) return;

    this.isDragging.set(false);
    const endX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].clientX;
    const deltaX = endX - this.startX();

    if (Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    }
    this.resumeAutoPlay();
  }
}
