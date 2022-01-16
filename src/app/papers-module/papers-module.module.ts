import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PapersModuleRoutingModule } from './papers-module-routing.module';
import { PapersModuleComponent } from './papers-module.component';


@NgModule({
  declarations: [
    PapersModuleComponent
  ],
  imports: [
    CommonModule,
    PapersModuleRoutingModule
  ]
})
export class PapersModuleModule { }
