import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdnizePipe } from './cdnize.pipe';
import { EllipsisPipe } from './ellipsis.pipe';
import { RenderTemplatePipe } from './render-template.pipe';
import { SupplierNameTransformPipe } from './supplier-name-transform.pipe';
@NgModule({
  declarations: [CdnizePipe, EllipsisPipe, RenderTemplatePipe, SupplierNameTransformPipe],
  imports: [CommonModule],
  exports: [CdnizePipe, EllipsisPipe, RenderTemplatePipe, SupplierNameTransformPipe],
  providers: [CdnizePipe, EllipsisPipe, RenderTemplatePipe, SupplierNameTransformPipe],
})
export class PipesModule {}
