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
  duration?: number;
}

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, CdnizePipe, NgStyle],
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

  private autoPlayTimer: ReturnType<typeof setTimeout> | null = null;
  isDragging = signal(false);
  private startX = signal(0);
  private readonly threshold = 50;

  hasDragged = signal(false);

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
      this.updateIndexes();
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.pauseAutoPlay();
  }

  ngOnChanges(): void {
    this.loadedImages.set(new Set());
    this.updateIndexes();
    this.resumeAutoPlay();
  }

  updateIndexes(): void {
    if (this.slides().length % 2 === 1) {
      this.currentIndex.set(Math.floor(this.slides().length / 2));
    } else {
      this.currentIndex.set(0);
    }
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
        style['transform'] = 'translateX(0) scale(0.75)';
        style['filter'] = 'blur(0)';
        style['opacity'] = 1;
      } else if (offset === -1) {
        // Previous slide
        style['transform'] = 'translateX(-40%) scale(0.6)';
        style['opacity'] = 0.6;
      } else if (offset === 1) {
        // Next slide
        style['transform'] = 'translateX(40%) scale(0.6)';
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

  getDotStyle(i: number): Record<string, string> {
    const isActive = i === this.currentIndex();
    const duration = this.slides()[i]?.duration || this.autoPlayInterval();
    const width = isActive ? Math.min(1 + (duration / 5000) * 1.5, 4) : 1;

    return {
      width: `${width}rem`,
      backgroundColor: isActive ? 'white' : 'rgb(156 163 175)',
    };
  }

  goToSlide(index: number): void {
    this.currentIndex.set(index);
    this.scheduleAutoPlay();
  }

  startAutoPlay(): void {
    this.pauseAutoPlay();
    this.scheduleAutoPlay();
  }

  scheduleAutoPlay(): void {
    const currentSlide = this.slides()[this.currentIndex()];
    const duration = currentSlide?.duration || this.autoPlayInterval();
    this.autoPlayTimer = setTimeout(() => {
      this.nextSlide();
    }, duration);
  }

  pauseAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resumeAutoPlay(): void {
    if (this.slides()?.length > 1) {
      this.startAutoPlay();
    }
  }

  nextSlide(): void {
    this.currentIndex.update((current) => (current + 1) % this.slides().length);
    this.scheduleAutoPlay();
  }

  prevSlide(): void {
    this.currentIndex.update((current) => (current === 0 ? this.slides().length - 1 : current - 1));
    this.scheduleAutoPlay();
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
      return;
    }
    this.isDragging.set(true);
    this.hasDragged.set(false);
    this.startX.set(e instanceof MouseEvent ? e.clientX : e.touches[0].clientX);
    this.pauseAutoPlay();
  }

  handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging()) return;

    const currentX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - this.startX();
    if (Math.abs(deltaX) > 10) {
      this.hasDragged.set(true);
    }

    if (this.hasDragged()) {
      e.preventDefault();
    }
  }

  handleEnd(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging()) return;

    if (this.hasDragged()) {
      const endX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].clientX;
      const deltaX = endX - this.startX();

      if (Math.abs(deltaX) > this.threshold) {
        if (deltaX > 0) {
          this.prevSlide();
        } else {
          this.nextSlide();
        }
      }
    }

    this.isDragging.set(false);
    this.resumeAutoPlay();
  }
}
