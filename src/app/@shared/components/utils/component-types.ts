import { ComponentRef, InjectionToken, Type } from '@angular/core';

export type ComponentTypeProps = {
  class: Type<any>;
  updateInputs: ((componentRef: ComponentRef<any>, values: any) => void) | undefined;
};
export type ComponentTypesMapType = {
  [key: string]: ComponentTypeProps;
};
export const COMPONENT_TYPES_MAP = new InjectionToken<ComponentTypesMapType>('Component types map for ComponentLoader');

/** list of types that can be dynamically loaded */
export type ComponentTypes =
  // | 'main-banner-standard'
  // | 'main-banner-image'
  'none';

/** Map of types that can be dynamically loaded with data for component creation. */
// export const ComponentTypesMap: { [Property in ComponentTypes as Exclude<Property, 'none'>]: ComponentTypeProps } = {
export const ComponentTypesMap = {
  // 'main-banner-standard': {
  //   class: MainBannerWithTextComponent,
  //   updateInputs: (componentRef: ComponentRef<MainBannerWithTextComponent>, values: MainBannerWithTextData) => {
  //     // componentRef.instance.title = values.title;
  //     // componentRef.instance.subtitle = values.subtitle;
  //     // componentRef.instance.backgroundImgUrl = values.backgroundImgUrl;
  //     // componentRef.instance.buttonText = values.buttonText;
  //     // componentRef.instance.useTopBottomGradient = values.useTopBottomGradient;
  //     for (const key in values) {
  //       if (Object.prototype.hasOwnProperty.call(values, key)) {
  //         const value = values[key];
  //         componentRef.setInput(key, value);
  //       }
  //     }
  //   },
  // },
  // 'main-banner-image': { class: MainBannerImageComponent, updateInputs: undefined },
};
