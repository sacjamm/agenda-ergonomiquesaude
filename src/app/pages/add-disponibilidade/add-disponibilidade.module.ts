import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddDisponibilidadePageRoutingModule } from './add-disponibilidade-routing.module';

import { AddDisponibilidadePage } from './add-disponibilidade.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddDisponibilidadePageRoutingModule
  ],
  declarations: [AddDisponibilidadePage]
})
export class AddDisponibilidadePageModule {}
