import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-add-agendamento-colaborador',
  templateUrl: './add-agendamento-colaborador.page.html',
  styleUrls: ['./add-agendamento-colaborador.page.scss'],
  standalone: false,
})
export class AddAgendamentoColaboradorPage implements OnInit {

  public usuario_id: number = 0;
  public empresa_id: number = 0;
  public disponibilidade_id: number = 0;
  intervalo: number = 0;

  datasDisponiveis: any[] = [];
  dataSelecionada: string | null = null;

  profissionalSelecionado: number | null = null;
  profissionais: any[] = [];

  minDataDisponivel: string = '';
  maxDataDisponivel: string = '';

  public horariosDisponiveis: any[] = [];
  public horarioSelecionado: string | null = null;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private loadingCtrl: LoadingController, private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'assinante' && userLogado.agenda_funcao_usuario === 'colaborador') {
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
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
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
      mode: 'cors',
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

  async onDataSelecionada() {
    this.horariosDisponiveis = [];
    this.horarioSelecionado = null;

    if (!this.dataSelecionada || !this.profissionalSelecionado) return;

    // Descobre o disponibilidade_id da data selecionada
    //const disponibilidade = this.datasDisponiveis.find(d => d.data === this.dataSelecionada.split('T')[0]);

    const dataSelecionadaStr = this.dataSelecionada ? this.dataSelecionada.split('T')[0] : '';
    const disponibilidade = this.datasDisponiveis.find(d => d.data === dataSelecionadaStr);
    if (!disponibilidade) return;

    this.disponibilidade_id = disponibilidade.id;
    this.intervalo = disponibilidade.intervalo;

    const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'listar_horarios_disponiveis',
        empresa_id: this.empresa_id,
        profissional_id: this.profissionalSelecionado,
        disponibilidade_id: disponibilidade.id,
        data: disponibilidade.data
      })
    });
    const data = await response.json();
    if (data.status === 200 && data.horas) {
      this.horariosDisponiveis = data.horas;
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

  /*public isDateEnabled = (dateIsoString: string): boolean => {
    const date = dateIsoString.split('T')[0];
    const hoje = new Date();
    const dataSelecionada = new Date(date);

    // Permite apenas datas disponíveis e que não sejam anteriores a hoje
    const disponivel = this.datasDisponiveis.some(d => d.data === date);
    const naoPassou = dataSelecionada >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    return disponivel && naoPassou;
  };*/

  public isDateEnabled = (dateIsoString: string): boolean => {
    const date = dateIsoString.split('T')[0]; // "YYYY-MM-DD"
    const hoje = new Date();

    // Corrige o erro de fuso: cria a data como local (ano, mês, dia)
    const [ano, mes, dia] = date.split('-').map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia); // mês começa em 0

    const disponivel = this.datasDisponiveis.some(d => d.data === date);
    const naoPassou = dataSelecionada >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    return disponivel && naoPassou;
  };

  async salvarAgenda() {

    if (
      !this.empresa_id ||
      !this.profissionalSelecionado ||
      !this.dataSelecionada ||
      !this.horarioSelecionado ||
      !this.disponibilidade_id
    ) {
      this.presentToast('Preencha todos os campos obrigatórios e selecione pelo menos um horário.', 'warning');
      return;
    }

    // Monta os dados conforme a endpoint espera
    const payload = {
      action: 'add_agendamento',
      empresa_id: this.empresa_id,
      profissional_id: this.profissionalSelecionado,
      usuario_id: this.usuario_id,
      disponibilidade_id: this.disponibilidade_id,
      horario_id: this.horarioSelecionado,
      intervalo: this.intervalo
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
        this.profissionalSelecionado = 0;
        this.horarioSelecionado = '';
        this.disponibilidade_id = 0;
        // Redireciona para a tela desejada (ajuste a rota conforme necessário)
        this.presentToast(data.message, 'success').then(() => {
          this.router.navigate(['/listar-agendamentos-colaborador']);
        });
      } else {
        this.presentToast(data.message || 'Erro ao salvar agendamento.', 'danger');
      }
    } catch (error) {
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
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
}
