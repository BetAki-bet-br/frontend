import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';
import { AssetsService } from '../assets.service';
import { BRAND } from '@app/@core/brand';

@Directive({
  selector: '[appImageProcessor]',
})
export class ImageProcessorDirective implements OnInit {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  assetsService = inject(AssetsService);
  private readonly fallbackSrc = inject(BRAND).assets.logo;

  @Input('appImageProcessor') imageSrc = '';
  @Input() public styles: { [key: string]: string } = {};

  public src = '';
  public imageLoading = true;

  constructor() {
    this.src = this.fallbackSrc;
  }

  ngOnInit(): void {
    this.renderer.addClass(this.elementRef.nativeElement, 'image-processor'); // Add any necessary CSS classes

    const imageElement = this.renderer.createElement('img');
    this.renderer.listen(imageElement, 'load', this.handleImageOnLoad);
    this.renderer.listen(imageElement, 'error', this.handleImageOnError);

    if (this.imageSrc) {
      imageElement.src = this.imageSrc;
    } else {
      imageElement.src = this.src;
    }

    // Apply styles to the image element
    Object.keys(this.styles).forEach((style) => {
      this.renderer.setStyle(imageElement, style, this.styles[style]);
    });

    this.renderer.appendChild(this.elementRef.nativeElement, imageElement);
  }

  private handleImageOnLoad = () => {
    if (!this.imageLoading) return;
    this.imageLoading = false;
    this.src = this.imageSrc;
  };

  private handleImageOnError = () => {
    this.src = this.fallbackSrc;
  };
}
