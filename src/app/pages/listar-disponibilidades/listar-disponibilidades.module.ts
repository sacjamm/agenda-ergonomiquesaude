import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListarDisponibilidadesPageRoutingModule } from './listar-disponibilidades-routing.module';

import { ListarDisponibilidadesPage } from './listar-disponibilidades.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListarDisponibilidadesPageRoutingModule
  ],
  declarations: [ListarDisponibilidadesPage]
})
export class ListarDisponibilidadesPageModule {}
