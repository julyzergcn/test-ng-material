import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DragDropComponent } from './drag-drop/drag-drop.component';
import { PaperComponent } from './paper/paper.component';
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
    path: 'paper',
    component: PaperComponent
  },
  {
    path: 'drag-drop',
    component: DragDropComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
