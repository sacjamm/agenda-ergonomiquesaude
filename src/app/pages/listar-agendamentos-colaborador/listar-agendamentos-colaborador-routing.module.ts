import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarAgendamentosColaboradorPage } from './listar-agendamentos-colaborador.page';

const routes: Routes = [
  {
    path: '',
    component: ListarAgendamentosColaboradorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListarAgendamentosColaboradorPageRoutingModule {}
