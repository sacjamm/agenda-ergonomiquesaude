import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-add-agendamento-colaborador',
  templateUrl: './add-agendamento-colaborador.page.html',
  styleUrls: ['./add-agendamento-colaborador.page.scss'],
  standalone: false,
})
export class AddAgendamentoColaboradorPage implements OnInit {

  public usuario_id: number = 0;
  public empresa_id: number = 0;

  datasDisponiveis: any[] = [];
  dataSelecionada: string | null = null;

  profissionalSelecionado: number | null = null;
  profissionais: any[] = [];

  minDataDisponivel: string = '';
  maxDataDisponivel: string = '';
  //isDateEnabled: string[] = [];

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado?.nivel === 'assinante' && userLogado?.agenda_funcao_usuario === 'colaborador') {
      this.usuario_id = userLogado.id;
      this.empresa_id = userLogado.empresa_id;
      await this.listarProfissionais();
    }
  }

  async listarProfissionais() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando agendas...'
    });
    await loading.present();

    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Parâmetro CORS
        body: JSON.stringify({
          empresa_id: this.empresa_id,
          action: 'listar_profissionais'
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        this.profissionais = data.profissionais;
      } else {
        this.profissionais = [];
      }
    } catch (error) {
      this.profissionais = [];
      alert('Erro ao conectar ao servidor.');
    } finally {
      await loading.dismiss();
    }
  }

  async onProfissionalChange() {
    this.datasDisponiveis = [];
    this.dataSelecionada = null;
    if (!this.profissionalSelecionado) return;

    const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'listar_datas_disponiveis',
        empresa_id: this.empresa_id,
        profissional_id: this.profissionalSelecionado
      })
    });
    const data = await response.json();
    if (data.status === 200 && data.datas) {
      this.datasDisponiveis = data.datas;

      // Defina min/max e datas desabilitadas para o calendário
      const datas = this.datasDisponiveis.map(d => d.data);
      this.minDataDisponivel = datas[0];
      this.maxDataDisponivel = datas[datas.length - 1];

      // Desabilita todas as datas exceto as disponíveis
      const allDates = this.getAllDatesBetween(this.minDataDisponivel, this.maxDataDisponivel);
      //this.isDateEnabled = allDates.filter(d => !datas.includes(d));
    }
  }

  // Gera todas as datas entre min e max para desabilitar as não disponíveis
  getAllDatesBetween(start: string, end: string): string[] {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  public isDateEnabled = (dateIsoString: string): boolean => {
  // datasDisponiveis deve conter as datas no formato 'YYYY-MM-DD'
  const date = dateIsoString.split('T')[0];
  return this.datasDisponiveis.some(d => d.data === date);
};
}
