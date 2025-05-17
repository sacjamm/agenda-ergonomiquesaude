import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
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
        private actionSheetCtrl: ActionSheetController
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
          pagina:this.pagina,
          limite:this.limite
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
        {
          icon: 'create',
          text: 'Alterar Status',
          data: {
            action: 'alterar_status',
          },
        },
        {
          icon: 'logo-google',
          text: 'Adicionar ao Google Calendar',
          data: {
            action: 'google',
          },
        },
        {
          icon: 'trash',
          text: 'Remover Agendamento',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },        
        {
          icon: 'close',
          text: 'Cancelar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }
}
