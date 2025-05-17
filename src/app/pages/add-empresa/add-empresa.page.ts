import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-add-empresa',
  templateUrl: './add-empresa.page.html',
  styleUrls: ['./add-empresa.page.scss'],
  standalone: false,
})
export class AddEmpresaPage implements OnInit {

  public usuario_id: number = 0;
  public empresa_id: number = 0;
  cnpj: string = '';
  razao_social: string = '';
  agenda_funcao_usuario: string = '';

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private loadingCtrl: LoadingController, private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'admin') {
      this.usuario_id = userLogado.id;
      this.empresa_id = userLogado.empresa_id;
    }
  }
async salvarUser(){ 
  const payload = {
    action: 'add_usuario',
    cnpj: this.cnpj,
    razao_social: this.razao_social,
    agenda_funcao_usuario: this.agenda_funcao_usuario
  };

  try {
    const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.status === 200) {
      // Limpa o formulário
      this.empresa_id = 0;
      this.razao_social = '';
      this.cnpj = '';
      this.agenda_funcao_usuario='';
      // Redireciona para a tela desejada (ajuste a rota conforme necessário)
      this.presentToast('Empresa cadastrada com sucesso!','success').then(() => {
        this.router.navigate(['/listar-empresas']);
      });
    } else {
      this.presentToast(data.message || 'Erro ao salvar empresa.','danger');
    }
  } catch (error) {
    this.presentToast('Erro ao conectar ao servidor.','danger');
  }
}
  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
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

  formatarCNPJ(event: any): void {
    const valor = event.detail.value;
    this.cnpj = this.mascararCNPJ(valor);
  }
  mascararCNPJ(cnpj: string): string {
    cnpj = cnpj.replace(/\D/g, ''); // Remove tudo que não for dígito

    if (cnpj.length <= 14) {
      cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
      cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
      cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
    }

    return cnpj;
  }

  

}
