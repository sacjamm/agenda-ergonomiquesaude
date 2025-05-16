import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  email: string = '';
  senha: string = '';
  loading: boolean = false;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private menuCtrl: MenuController
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false); // desabilita o menu ao entrar na tela de login
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true); // habilita o menu ao sair da tela de login
  }

  ngOnInit() {
  }

  async login(event: Event) {
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
          username: this.email, // pode ser email ou usuário
          password: this.senha,
          action: 'login_usuario'
        })
      });

      const data = await response.json();

      if (data.status === 200 && data.token && data.usuario) {
        // Salva todos os dados retornados do endpoint
        await this.preferencesService.set('login_data', data);
        const userLogado = await this.preferencesService.getUsuarioLogado();
        console.log(userLogado);
         alert(data.message || 'Login realizado com sucesso!');
        this.router.navigate(['/folder/inbox']);
        
      } else {
        alert(data.message || 'E-mail/Usuário ou senha inválidos.');
      }
    } catch (error) {
      alert('Erro ao conectar ao servidor.');
    } finally {
      this.loading = false;
    }
  }

}
