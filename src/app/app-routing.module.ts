import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressFormComponent } from './address-form/address-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { TableComponent } from './table/table.component';
import { TreeComponent } from './tree/tree.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'table',
    component: TableComponent
  },
  {
    path: 'tree',
    component: TreeComponent
  },
  {
    path: 'address-form',
    component: AddressFormComponent
  },
  {
    path: 'drag-drop',
    component: DragDropComponent
  },
  { path: 'papers', loadChildren: () => import('./papers-module/papers-module.module').then(m => m.PapersModuleModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
