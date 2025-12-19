import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AssetsService } from '../assets.service';

@Directive({
  selector: '[appImageProcessor]',
})
export class ImageProcessorDirective implements OnInit {
  @Input('appImageProcessor') imageSrc = '';
  @Input() public styles = {};

  public src = '';
  public imageLoading = true;

  constructor(private elementRef: ElementRef, private renderer: Renderer2, public assetsService: AssetsService) {
    this.src = '/assets/general/logo/betaki-logo.png';
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
    this.src = '/assets/general/logo/betaki-logo.png';
  };
}
