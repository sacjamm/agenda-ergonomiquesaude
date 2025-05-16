import { Component } from '@angular/core';
import { PreferencesService } from './services/preferences.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  public appPages = [
    { title: 'Home', url: '/folder/inbox', icon: 'home' },
  ];
  
  constructor(private preferencesService: PreferencesService,
    private router: Router) { }
  async logout() {
    await this.preferencesService.clear(); // Limpa todos os dados salvos
    this.router.navigate(['/login']); // Redireciona para login
  }
}
