import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Input, ViewChild } from '@angular/core';
import { ComponentLoaderDirective } from './component-loader.directive';

import { Component, OnInit } from '@angular/core';
import { ComponentTypesMapType, COMPONENT_TYPES_MAP } from './component-types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  template: `<div>Test template component</div>`,
  imports: [],
})
export class TestComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
@Component({
  selector: 'app-test-input',
  template: `
    <div>Test template component</div>
    @if (displaySecondDiv) {
    <div></div>
    }
  `,
  imports: [],
})
export class TestInputComponent implements OnInit {
  @Input() displaySecondDiv = false;

  constructor() {}

  ngOnInit() {}
}

@Component({
  selector: 'app-test-input-custom',
  template: ` <div>{{ data }}</div> `,
})
export class TestInputCustomComponent implements OnInit {
  @Input() data = '';

  constructor() {}

  ngOnInit() {}
}

const stringToAdd = 'added string';
const ComponentTypesMap: ComponentTypesMapType = {
  test: {
    class: TestComponent,
    updateInputs: undefined,
  },
  testInput: {
    class: TestInputComponent,
    updateInputs: undefined,
  },
  testInputCustomFn: {
    class: TestInputCustomComponent,
    updateInputs: (componentRef, values: { data: string }) => {
      componentRef.setInput('data', (values.data ?? '') + stringToAdd);
    },
  },
};

@Component({
  template: `
    <ng-template
      #loader="componentLoader"
      [appComponentLoader]="componentData"
      [componentType]="componentType"
      (componentInstanceChange)="onComponentInstanceChange($event)"
    />
  `,
  imports: [],
})
export class ComponentLoaderWrapperComponent implements OnInit {
  @Input() componentType: string = 'test';
  @Input() componentData: any = {};

  @ViewChild('loader', { static: false }) loader!: ComponentLoaderDirective;

  componentInstance: any;

  constructor() {}

  ngOnInit() {}

  onComponentInstanceChange(event: any) {
    this.componentInstance = event;
  }
}

describe('ComponentLoaderDirective', () => {
  let component: ComponentLoaderWrapperComponent;
  let fixture: ComponentFixture<ComponentLoaderWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ComponentLoaderDirective,
        ComponentLoaderWrapperComponent,
        TestComponent,
        TestInputComponent,
      ],
      providers: [{ provide: COMPONENT_TYPES_MAP, useValue: ComponentTypesMap }],
    }).compileComponents();
  }));

  describe('With component w/o input on first load', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ComponentLoaderWrapperComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create an instance', () => {
      expect(component.loader).toBeTruthy();
      expect(component).toBeTruthy();
    });

    it('should emit the created component instance', () => {
      expect(component.componentInstance).toBeTruthy();
      expect(component.componentInstance instanceof TestComponent).toBeTruthy();
    });

    it('should emit the created component instance on type change', () => {
      fixture.componentRef.setInput('componentType', 'testInput');
      fixture.detectChanges();

      expect(component.componentInstance).toBeTruthy();
      expect(component.componentInstance instanceof TestInputComponent).toBeTruthy();
    });

    it('should have loaded component', () => {
      const elementChildren = fixture.debugElement.children;

      expect(elementChildren.length).toBe(1);
      expect(elementChildren[0].nativeNode.localName).toBe('app-test');
    });

    it('should have unloaded the component', () => {
      fixture.componentRef.setInput('componentType', 'none');
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(0);
    });

    it('should replace the component on type change', () => {
      fixture.componentRef.setInput('componentType', 'testInput');
      fixture.componentRef.setInput('componentData', { displaySecondDiv: true });
      fixture.detectChanges();

      expect(fixture.debugElement.children.length).toBe(1);
      expect(fixture.debugElement.children[0].nativeNode.localName).toBe('app-test-input');
    });
  });

  describe('With component Input on first load', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ComponentLoaderWrapperComponent);
      component = fixture.componentInstance;
      component.componentType = 'testInput';
      component.componentData = { displaySecondDiv: true };
      fixture.detectChanges();
    });

    it('should create an instance', () => {
      expect(component.loader).toBeTruthy();
      expect(component).toBeTruthy();
    });

    it('should have loaded component', () => {
      const elementChildren = fixture.debugElement.children;

      expect(elementChildren.length).toBe(1);
      expect(elementChildren[0].nativeNode.localName).toBe('app-test-input');

      const componentElementChildren = elementChildren[0].children;
      expect(componentElementChildren.length).toBe(2, 'check div is displayed');
    });

    it('should hide second div', () => {
      fixture.componentRef.setInput('componentData', { displaySecondDiv: false });
      fixture.detectChanges();

      const componentElementChildren = fixture.debugElement.children[0].children;
      expect(componentElementChildren.length).toBe(1, 'check div is hidden');
    });
  });

  describe('With component Input and custom updateInput on first load', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(ComponentLoaderWrapperComponent);
      component = fixture.componentInstance;
      component.componentType = 'testInputCustomFn';
      fixture.detectChanges();
    });

    it('should create an instance', () => {
      expect(component.loader).toBeTruthy();
      expect(component).toBeTruthy();
    });

    it('should have loaded component', () => {
      const elementChildren = fixture.debugElement.children;

      expect(elementChildren.length).toBe(1);
      expect(elementChildren[0].nativeNode.localName).toBe('app-test-input-custom');

      const componentElementChildren = elementChildren[0].children;
      expect(componentElementChildren.length).toBe(1, 'check div is displayed');

      expect(componentElementChildren[0].nativeElement.innerHTML).toMatch(stringToAdd);
    });

    it('should use custom updateInput', () => {
      const text = 'foo';
      fixture.componentRef.setInput('componentData', { data: text });
      fixture.detectChanges();

      const elementChildren = fixture.debugElement.children;
      const componentElementChildren = elementChildren[0].children;
      expect(componentElementChildren[0].nativeElement.innerHTML).toMatch(text + stringToAdd);
    });
  });
});
