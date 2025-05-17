import { Component, OnInit } from '@angular/core';
import { PreferencesService } from './services/preferences.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  deferredPrompt: any;
  showInstallBanner = false;

  public appPages = [
    { title: 'Home', url: '/folder/inbox', icon: 'home' },
  ];

  emailConfig: string = '';
  nomeConfig: string = '';

  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    this.emailConfig = userLogado.email;
    this.nomeConfig = userLogado.name;
    if (userLogado.nivel === 'assinante' && userLogado.agenda_funcao_usuario === 'colaborador') {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
        { title: 'Agendamentos', url: '/listar-agendamentos-colaborador', icon: 'calendar' },
      ];
    } else if (userLogado.nivel === 'admin') {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
        { title: 'Disponibilidades', url: '/listar-disponibilidades', icon: 'calendar' },
        { title: 'Empresas', url: '/listar-empresas', icon: 'business' },
        { title: 'Agendamentos', url: '/listar-agendamentos', icon: 'calendar' },
      ];
    } else {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
      ];
    }

    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault(); // Impede o prompt automático
      this.deferredPrompt = event;
      this.showInstallBanner = true; // Mostra o balão flutuante
    });
  }

  instalarApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou instalar o app');
        } else {
          console.log('Usuário rejeitou a instalação');
        }
        this.deferredPrompt = null;
        this.showInstallBanner = false;
      });
    }
  }

  fecharBanner() {
    this.showInstallBanner = false;
  }

  async logout() {
    await this.preferencesService.logout(); // Limpa todos os dados salvos
    window.location.href = '/login';
    //this.router.navigate(['/login']); // Redireciona para login
  }
}
