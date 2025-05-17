import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule
  ],
  declarations: [FolderPage]
})
export class FolderPageModule {}
