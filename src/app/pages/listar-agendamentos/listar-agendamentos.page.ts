import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-listar-agendamentos',
  templateUrl: './listar-agendamentos.page.html',
  styleUrls: ['./listar-agendamentos.page.scss'],
  standalone: false,
})
export class ListarAgendamentosPage implements OnInit {

  public agendamentos: any[] = [];
  public usuario_id: number = 0;
  public empresa_id: number = 0;
  pagina: number = 1;
  limite: number = 20;
  public carregando = false;
  public fimDaLista = false;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {

    

    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'admin') {
      this.usuario_id = userLogado.id;
      this.empresa_id = userLogado.empresa_id;
      await this.listarAgendamentos(true);
    }
  }

  async listarAgendamentos(reset = false, event?: any) {
    if (this.carregando) return;
    this.carregando = true;
    if (reset) {
      this.pagina = 1;
      this.fimDaLista = false;
      this.agendamentos = [];
    }
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
          action: 'listar_agendamentos_admin',
          busca: '',
          pagina: this.pagina,
          limite: this.limite
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
        this.agendamentos = reset ? novas : [...this.agendamentos, ...novas];
        if (novas.length < this.limite) this.fimDaLista = true;
        else this.pagina++;
      } else {
        if (reset) this.agendamentos = [];
        this.fimDaLista = true;
      }


    } catch (error) {
      if (reset) this.agendamentos = [];
      this.fimDaLista = true;
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
    } finally {
      this.carregando = false;
      if (event) event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.listarAgendamentos(true, event);
  }

  carregarMais() {
    this.listarAgendamentos(false);
  }

  getDiaSemanaPorExtenso(data: string): string {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
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
            action: 'remover_agendamento_admin',
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
  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    toast.present();
  }

  async presentActionSheet(agendamento: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ações',
      buttons: [
        /*{
          icon: 'create',
          text: 'Alterar Status',
          handler: () => {
            this.alterarStatusAgendamento(agendamento);
          },
          data: {
            action: 'alterar_status',
          },
        },*/
        {
          icon: 'logo-google',
          text: 'Adicionar ao Google Calendar',
          handler: () => {
            if (confirm('Tem certeza que deseja adicionar esse agendamento no Google Calendar?')) {

              this.adicionarAoGoogleCalendar(agendamento);
            }
          },
          data: {
            action: 'google',
          },
        },
        {
          icon: 'trash',
          text: 'Remover Agendamento',
          role: 'destructive',
          handler: () => {
            this.cancelarAgendamento(agendamento);
          },
          data: {
            action: 'delete',
          },
        },
        {
          icon: 'close',
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            // Apenas fecha o ActionSheet
          },
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  // Exemplo de métodos de callback (implemente conforme sua lógica)
  alterarStatusAgendamento(agendamento: any) {
    this.presentToast('Alterar status não implementado.', 'warning');
    // Implemente aqui a lógica de alteração de status
  }

  adicionarAoGoogleCalendar(agendamento: any) {
    // 1. Verifique se já existe token salvo (opcional, pode sempre pedir login Google)
    // 2. Redirecione para o consentimento Google se necessário
    // 3. Após consentimento, envie o agendamento para o backend

    // a) Redireciona para o consentimento Google
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
        this.presentToast('Evento adicionado ao Google Calendar com sucesso!', 'success');
      } else {
        this.presentToast(data.message || 'Erro ao adicionar evento ao Google Calendar.', 'danger');
      }
    } catch (error) {
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
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
}
