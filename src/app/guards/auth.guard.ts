import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { PreferencesService } from "../services/preferences.service"

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const usuario = await this.preferencesService.getUsuarioLogado();
    if (usuario) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}