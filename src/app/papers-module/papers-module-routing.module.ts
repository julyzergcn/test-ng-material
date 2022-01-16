import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PapersModuleComponent } from './papers-module.component';

const routes: Routes = [{ path: '', component: PapersModuleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PapersModuleRoutingModule { }
