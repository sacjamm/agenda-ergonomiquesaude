import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-disponibilidades',
  templateUrl: './listar-disponibilidades.page.html',
  styleUrls: ['./listar-disponibilidades.page.scss'],
  standalone: false,
})
export class ListarDisponibilidadesPage implements OnInit {

  public isColaborador = false;
  public isAdmin = false;
  public isProfissional = false;

  public disponibilidades: any[] = [];
  public pagina = 1;
  public limite = 10;
  public carregando = false;
  public fimDaLista = false;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado?.nivel === 'admin') {
      this.isColaborador = false;
      this.isAdmin = true;
      this.isProfissional = false;

      await this.carregarDisponibilidades(true);
    } else if (userLogado?.nivel === 'funcionario') {
      this.isColaborador = false;
      this.isAdmin = false;
      this.isProfissional = true;
    } else {
      this.isColaborador = false;
      this.isAdmin = false;
      this.isProfissional = false;
    }
  }

  async carregarDisponibilidades(reset = false, event?: any) {
    if (this.carregando) return;
    this.carregando = true;
    if (reset) {
      this.pagina = 1;
      this.fimDaLista = false;
      this.disponibilidades = [];
    }
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          action: 'listar_disponibilidades_admin',
          pagina: this.pagina,
          limite: this.limite,
          busca: '' // ou algum termo de busca
        })
      });
      const data = await response.json();

      if (data.status === 200 && data.dados && data.dados.length) {
        // Para cada disponibilidade, buscar os horários (usando o campo horarios_json)
        const novas = data.dados.map((disp: any) => {
         return {
            ...disp
          };
        });
        this.disponibilidades = reset ? novas : [...this.disponibilidades, ...novas];
        if (novas.length < this.limite) this.fimDaLista = true;
        else this.pagina++;
      } else {
        if (reset) this.disponibilidades = [];
        this.fimDaLista = true;
      }
    } catch (error) {
      if (reset) this.disponibilidades = [];
      this.fimDaLista = true;
      alert('Erro ao conectar ao servidor.');
    }
    this.carregando = false;
    if (event) event.target.complete();
  }

  doRefresh(event: any) {
    this.carregarDisponibilidades(true, event);
  }

  carregarMais() {
    this.carregarDisponibilidades(false);
  }

  getDiaSemanaPorExtenso(data: string): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dataObj = new Date(data);
  return dias[dataObj.getDay()];
}
}
