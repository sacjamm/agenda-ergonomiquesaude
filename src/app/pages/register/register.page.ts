import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { MenuController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  cnpj: string = '';
  nome: string = '';
  email: string = '';
  senha: string = '';
  loading: boolean = false;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private menuCtrl: MenuController,
    private toastController: ToastController
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false); // desabilita o menu ao entrar na tela de login
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // habilita o menu ao sair da tela de login
  }

  ngOnInit() {
  }
  async cadastro(event: any) {
    await this.preferencesService.logout();
    event.preventDefault();
    this.loading = true;

    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Parâmetro CORS
        body: JSON.stringify({
          email: this.email, // pode ser email ou usuário
          senha: this.senha,
          cnpj: this.cnpj,
          nome: this.nome,
          action: 'add_usuario'
        })
      });

      const data = await response.json();

      if (data.status === 200 && data.token && data.usuario) {
        // Salva todos os dados retornados do endpoint
        await this.preferencesService.set('login_data', data);
        window.location.href = '/folder/inbox';
        //this.router.navigate(['/folder/inbox']);

      } else {
        this.presentToast(data.message || 'E-mail/Usuário ou senha inválidos.', 'danger');
      }
    } catch (error) {
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
    } finally {
      this.loading = false;
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
