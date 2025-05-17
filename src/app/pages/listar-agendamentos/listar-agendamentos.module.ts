import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarAgendamentosPageRoutingModule } from './listar-agendamentos-routing.module';

import { ListarAgendamentosPage } from './listar-agendamentos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarAgendamentosPageRoutingModule
  ],
  declarations: [ListarAgendamentosPage]
})
export class ListarAgendamentosPageModule {}
