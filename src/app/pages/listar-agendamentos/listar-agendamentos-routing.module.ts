import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListarAgendamentosPage } from './listar-agendamentos.page';

const routes: Routes = [
  {
    path: '',
    component: ListarAgendamentosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListarAgendamentosPageRoutingModule {}
