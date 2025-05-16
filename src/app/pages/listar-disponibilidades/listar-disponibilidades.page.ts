import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
  public horarios: any[] = [];
  public pagina = 1;
  public limite = 10;
  public carregando = false;
  public fimDaLista = false;

  gridView: boolean = false;

  public horariosSelecionados: any[] = [];
  public disponibilidadeSelecionadaId: number | null = null;


  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'admin') {
      this.isColaborador = false;
      this.isAdmin = true;
      this.isProfissional = false;

      await this.carregarDisponibilidades(true);
    } else if (userLogado.nivel === 'funcionario') {
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
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
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
    /*const dataObj = new Date(data);
    return dias[dataObj.getDay()];*/
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia); // mês começa do zero
    return dias[dataObj.getDay()];
  }

  async verHorarios(disponivel: any) {
    this.disponibilidadeSelecionadaId = disponivel.disponibilidade_id;
    this.horariosSelecionados = [];
    this.gridView = true;
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          action: 'ver_horarios',
          disponibilidadeId: disponivel.disponibilidade_id,
          empresa_id: disponivel.empresa_id,
          profissional_id: disponivel.profissional_id,
        })
      });
      const data = await response.json();

      if (data.status === 200 && data.dados && data.dados.length) {
        // Para cada disponibilidade, buscar os horários (usando o campo horarios_json)
        this.horariosSelecionados = data.dados;

      } else {
        this.horariosSelecionados = [];
      }
    } catch (error) {
      this.horariosSelecionados = [];
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
    }
  }

  horariosSelectedManha() {
    return this.horariosSelecionados.filter(h => h.hora < '12:00')
  }
  horariosSelectedTarde() {
    return this.horariosSelecionados.filter(h => h.hora >= '12:00')
  }

  async removerHorario(hora: any) {
    const confirmacao = confirm('Deseja remover esse horário?');
    if (confirmacao) {
      try {
        const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({
            action: 'remover_hora',
            disponibilidade_id: hora.disponibilidade_id,
            horario_id: hora.id,
            hora: hora.hora,
            profissional_id: hora.profissional_id,
          })
        });
        const data = await response.json();

        if (data.status === 200) {
          this.horariosSelecionados = this.horariosSelecionados.filter(
            h => h.id !== hora.id
          );
          this.presentToast('Horário removido com sucesso.', 'success');
        } else {
          this.presentToast(data.message, 'danger');
        }
      } catch (error) {
        this.presentToast('Erro ao conectar ao servidor.', 'danger');
      }
    }
  }

  async removerDisponibilidade(disponivel: any) {
    const confirmacao = confirm('Deseja remover a disponibilidade?');
    if (confirmacao) {
      try {
        const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({
            action: 'remover_disponibilidade',
            disponibilidadeId: disponivel.disponibilidade_id,
            empresa_id: disponivel.empresa_id,
            data: disponivel.data_disponibilidade,
            profissional_id: disponivel.profissional_id,
          })
        });
        const data = await response.json();

        if (data.status === 200) {

          this.disponibilidades = this.disponibilidades.filter(
            d => d.disponibilidade_id !== disponivel.disponibilidade_id
          );
          // Se estava mostrando os horários dessa disponibilidade, fecha o grid
          if (this.disponibilidadeSelecionadaId === disponivel.disponibilidade_id) {
            this.disponibilidadeSelecionadaId = null;
            this.horariosSelecionados = [];
            this.gridView = false;
          } 
          this.presentToast(data.message, 'success');
        } else {
          this.presentToast(data.message, 'danger');
        }
      } catch (error) {
        this.presentToast('Erro ao conectar ao servidor.', 'danger');
      }
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    toast.present();
  }
}
