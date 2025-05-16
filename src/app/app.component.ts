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

  public appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
      ];

  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado?.nivel === 'assinante' && userLogado?.agenda_funcao_usuario === 'colaborador') {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
      ];
    } else if (userLogado?.nivel === 'admin') {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
        { title: 'Disponibilidades', url: '/disponibilidades', icon: 'calendar' },
      ];
    } else {
      this.appPages = [
        { title: 'Home', url: '/folder/inbox', icon: 'home' },
      ];
    }
  }

  async logout() {
    await this.preferencesService.logout(); // Limpa todos os dados salvos
    this.router.navigate(['/login']); // Redireciona para login
  }
}
