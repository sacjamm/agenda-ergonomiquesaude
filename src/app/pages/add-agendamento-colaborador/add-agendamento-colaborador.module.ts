import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddAgendamentoColaboradorPageRoutingModule } from './add-agendamento-colaborador-routing.module';

import { AddAgendamentoColaboradorPage } from './add-agendamento-colaborador.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddAgendamentoColaboradorPageRoutingModule
  ],
  declarations: [AddAgendamentoColaboradorPage]
})
export class AddAgendamentoColaboradorPageModule {}
