import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PreferencesService } from '../services/preferences.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false, 
})
export class FolderPage implements OnInit {
  public folder!: string;
  public isColaborador = false;
  public isAdmin = false;
  public isProfissional = false;
  public possuiAgenda = false;

  private activatedRoute = inject(ActivatedRoute);
  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'assinante' && userLogado.agenda_funcao_usuario === 'colaborador') {
      this.isColaborador = true;
      this.isAdmin = false;
      this.isProfissional = false;
      this.possuiAgenda = await this.verificaExisteAgendamento(userLogado.id);
    } else if (userLogado.nivel === 'admin') {
      this.isColaborador = false;
      this.isAdmin = true;
      this.isProfissional = false;
    } else if(userLogado.nivel === 'funcionario'){
      this.isColaborador = false;
      this.isAdmin = false;
      this.isProfissional = true;
    }else {
      this.isColaborador = false;
      this.isAdmin = true;
      this.isProfissional = false;
    } 
  }

  async verificaExisteAgendamento(user_id: number) {
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Parâmetro CORS
        body: JSON.stringify({
          usuario_id: user_id,
          action: 'verificar_se_usuario_possui_agendamento'
        })
      }); 

      const data = await response.json();

      if (data.status === 200 && data.possui_agendamento === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
      return false;
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    return toast.present();
  }
}

