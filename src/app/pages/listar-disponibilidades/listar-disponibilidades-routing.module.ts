import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarDisponibilidadesPage } from './listar-disponibilidades.page';

const routes: Routes = [
  {
    path: '',
    component: ListarDisponibilidadesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListarDisponibilidadesPageRoutingModule {}
