import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarAgendamentosColaboradorPageRoutingModule } from './listar-agendamentos-colaborador-routing.module';

import { ListarAgendamentosColaboradorPage } from './listar-agendamentos-colaborador.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarAgendamentosColaboradorPageRoutingModule
  ],
  declarations: [ListarAgendamentosColaboradorPage]
})
export class ListarAgendamentosColaboradorPageModule {}
