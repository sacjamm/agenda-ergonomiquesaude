import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-listar-agendamentos-colaborador',
  templateUrl: './listar-agendamentos-colaborador.page.html',
  styleUrls: ['./listar-agendamentos-colaborador.page.scss'],
  standalone: false,
})
export class ListarAgendamentosColaboradorPage implements OnInit {

  public agendamentos: any[] = [];
  public usuario_id: number = 0;
  public empresa_id: number = 0;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private toastController: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'assinante' && userLogado.agenda_funcao_usuario === 'colaborador') {
      this.usuario_id = userLogado.id;
      this.empresa_id = userLogado.empresa_id;
      await this.listarAgendamentos();
    }
  }

  async listarAgendamentos(event?: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando agendamentos...'
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
          usuario_id: this.usuario_id,
          empresa_id: this.empresa_id,
          action: 'listar_agendamentos_user'
        })
      });

      const data = await response.json();
      if (data.status === 200) {
        this.agendamentos = data.dados;
      } else {
        this.agendamentos = [];
      }
    } catch (error) {
      this.agendamentos = [];
      alert('Erro ao conectar ao servidor.');
    } finally {
      await loading.dismiss();
      if (event) event.target.complete();
    }
  }

  getDiaSemanaPorExtenso(data: string): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    /*const dataObj = new Date(data);
    return dias[dataObj.getDay()];*/
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia); // mês começa do zero
    return dias[dataObj.getDay()];
  }

  cancelarAgendamento(agendamento: any) {
    const confirmacao = confirm('Deseja remover o agendamento?');
    if (confirmacao) {

      if (agendamento.status === 'realizado' || agendamento.status === 'expirado' || agendamento.status === 'cancelado') {
        alert('Entre em contato com o suporte para remover o agendamento.');
        this.listarAgendamentos();
        return;
      }

      this.loadingCtrl.create({
        message: 'Removendo agendamento...'
      }).then(loading => {
        loading.present();
        fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify({
            usuario_id: this.usuario_id,
            action: 'remover_agendamento',
            agendamentoID: agendamento.agendamentoID
          })
        }).then(response => response.json())
          .then(data => {
            loading.dismiss();
            if (data.status === 200) {
              alert('Agendamento removido com sucesso.');
              this.listarAgendamentos();
            } else {
              alert('Erro ao remover o agendamento.');
            }
          })
          .catch(error => {
            loading.dismiss();
            alert('Erro ao conectar ao servidor.');
          });
      });
    }
  }

  return_status(status: string): string {
    const statusMap: Record<string, string> = {
      agendado: 'Agendado',
      em_breve: 'Em breve',
      expirado: 'Expirado',
      realizado: 'Realizado',
      cancelado: 'Cancelado'
    };

    return statusMap[status] || 'Desconhecido';
  }

  GoogleCalendarAgendamento(agendamento: any) {
    if (confirm('Deseja agendar essa consulta no Google Calendar?')) {
      const clientId = '439125110228-8rpggu9vem4aq4i3kbfvsndnpq0idenh.apps.googleusercontent.com';
      const redirectUri = encodeURIComponent('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php?action=callback_google');
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
      const url =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&access_type=offline` +
        `&prompt=consent`;

      // Salve o agendamentoID em localStorage para usar depois do callback
      localStorage.setItem('agendamentoID_google', agendamento.agendamentoID);

      // Redireciona para o Google
      window.location.href = url;
    }

  }

  async enviarEventoParaGoogleCalendar(agendamentoID: any) {
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          action: 'adicionar_google_calendar',
          agendamentoID: agendamentoID
        })
      });
      const data = await response.json();
      if (data.status === 200) {
        this.presentToast(data.message, 'success');
      } else {
        this.presentToast(data.message || 'Erro ao adicionar evento ao Google Calendar.', 'danger');
      }
    } catch (error) {
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
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
 