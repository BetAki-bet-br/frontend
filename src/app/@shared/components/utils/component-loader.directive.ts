import {
  Directive,
  Input,
  ViewContainerRef,
  ComponentRef,
  OnChanges,
  SimpleChanges,
  Inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { ComponentTypes, COMPONENT_TYPES_MAP, ComponentTypesMapType } from './component-types';

const log = new Logger('ComponentLoaderDirective');

/**
 * Directive that dynamically creates components and inserts them into the View Container.
 *
 * The type of the component is defined by the `componentType` input and the data for the
 * component is defined by the `appComponentLoader` input.
 *
 * Example:
 * ```
 * <ng-template [appComponentLoader]="componentData" [componentType]="type"></ng-template>
 * ```
 */
@Directive({
  selector: '[appComponentLoader]',
  exportAs: 'componentLoader',
})
export class ComponentLoaderDirective implements OnChanges {
  /** Data for the component */
  @Input() set appComponentLoader(val: any) {
    this._val = val;
  }

  /** Type of the component */
  @Input() componentType: ComponentTypes = 'none';

  /** Emits the created component instance */
  @Output() componentInstanceChange = new EventEmitter<any>();

  private _componentRef?: ComponentRef<any>;
  private _componentCreated = false;
  private _val: any;

  constructor(
    public viewContainerRef: ViewContainerRef,
    @Inject(COMPONENT_TYPES_MAP) private componentTypesMap: ComponentTypesMapType
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // log.debug('changes', changes);

    // Reload the component if type changes
    let componentReloaded = false;
    if (changes['componentType']) {
      const typeChange = changes['componentType'];

      if (typeChange.currentValue !== typeChange.previousValue || typeChange.isFirstChange()) {
        this.viewContainerRef.remove();
        this._componentRef = undefined;

        if (typeChange.currentValue !== 'none') {
          this._componentRef = this.createComponentRef(typeChange.currentValue);
          componentReloaded = true;
        }

        this._componentCreated = !!this._componentRef;

        if (this._componentRef?.instance) {
          this.componentInstanceChange.emit(this._componentRef.instance);
        }
      }
    }

    // Update inputs on new values, only if the component is already created
    if (this._componentCreated && (changes['appComponentLoader'] || componentReloaded)) {
      // Use the new values, if they exist. Else set the inputs for the old value.
      const val = changes['appComponentLoader']?.currentValue ?? this._val;

      this.updateComponentInputs(val);
    }
  }

  /**
   * Update the component inputs based on the update method. Use default `setInput()` if the update method does not exist.
   * @param newValue
   */
  private updateComponentInputs(newValue: any): void {
    const updateInputs = this.componentTypesMap[this.componentType].updateInputs;

    if (!this._componentRef) return;

    if (updateInputs !== undefined) {
      updateInputs(this._componentRef, newValue);
    } else {
      // Object.assign(this._componentRef.instance, newValue);
      for (const key in newValue) {
        if (Object.prototype.hasOwnProperty.call(newValue, key)) {
          const value = newValue[key];
          this._componentRef?.setInput(key, value);
        }
      }
    }
  }

  /**
   * Creates the component and adds it to the view container ref
   * @param componentType
   * @returns
   */
  private createComponentRef(componentType: ComponentTypes): ComponentRef<any> | undefined {
    if (componentType === 'none') {
      return undefined;
    }

    return this.viewContainerRef.createComponent<any>(this.componentTypesMap[componentType].class);
  }
}
