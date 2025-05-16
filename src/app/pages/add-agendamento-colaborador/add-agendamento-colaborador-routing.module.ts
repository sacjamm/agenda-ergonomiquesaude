import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddAgendamentoColaboradorPage } from './add-agendamento-colaborador.page';

const routes: Routes = [
  {
    path: '',
    component: AddAgendamentoColaboradorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddAgendamentoColaboradorPageRoutingModule {}
