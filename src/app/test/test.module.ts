import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestRoutingModule } from './test-routing.module';
import { FormComponent } from './form/form.component';
import { SharedModule } from '@app/@shared';
import { MaterialModule } from '@app/material.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FormComponent],
  imports: [CommonModule, SharedModule, ReactiveFormsModule, MaterialModule, TestRoutingModule],
})
export class TestModule {}
