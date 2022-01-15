import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaperComponent } from './paper/paper.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'paper'
  },
  {
    path: 'paper',
    component: PaperComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
