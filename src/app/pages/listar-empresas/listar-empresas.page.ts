import { Component, OnInit } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController,ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-listar-empresas',
  templateUrl: './listar-empresas.page.html',
  styleUrls: ['./listar-empresas.page.scss'],
  standalone: false, 
}) 
export class ListarEmpresasPage implements OnInit {

  public empresas: any[] = [];
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
    private actionSheetCtrl: ActionSheetController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado.nivel === 'admin') {
      this.usuario_id = userLogado.id;
      this.empresa_id = userLogado.empresa_id;
      await this.listarEmpresas(true);
    }
  } 

  async listarEmpresas(reset = false, event?: any) {
    if (this.carregando) return;
    this.carregando = true;
    if (reset) {
      this.pagina = 1;
      this.fimDaLista = false;
      this.empresas = [];
    }    
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Parâmetro CORS
        body: JSON.stringify({
          nivel:'admin',
          pagina:this.pagina,
          limite:this.limite,
          action: 'listar_empresas',
          busca: '' // ou algum termo de busca
        })
      }); 

      const data = await response.json();
      if (data.status === 200 && data.empresas && data.empresas.length) {
        // Para cada disponibilidade, buscar os horários (usando o campo horarios_json)
        const novas = data.empresas.map((disp: any) => {
          return {
            ...disp
          };
        });
        this.empresas = reset ? novas : [...this.empresas, ...novas];
        if (novas.length < this.limite) this.fimDaLista = true;
        else this.pagina++;
      } else {
        if (reset) this.empresas = [];
        this.fimDaLista = true;
      }
    } catch (error) {
     if (reset) this.empresas = [];
      this.fimDaLista = true;
      this.presentToast('Erro ao conectar ao servidor.', 'danger');
    } finally {
      this.carregando = false;
    if (event) event.target.complete();
    }
  }

  doRefresh(event: any) {
    this.listarEmpresas(true, event);
  }

  carregarMais() {
    this.listarEmpresas(false);
  }

  async cancelarEmpresa(empresa:any){
    const confirmacao = confirm('Deseja remover essa empresa?');
    if (confirmacao) {
      try {
        const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
          body: JSON.stringify({
            action: 'remover_empresa',
            id: empresa.id
            })
        });
        const data = await response.json();

        if (data.status === 200) {
          this.presentToast(data.message, 'success');
          this.empresas = this.empresas.filter(e => e.id !== empresa.id);
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

  async presentActionSheet(empresa: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ações',
      buttons: [
        {
          icon: 'trash',
          text: 'Remover Empresa',
          role: 'destructive',
          handler: () => {
            if(confirm('Tem certeza que deseja remover essa empresa?')){
              this.cancelarEmpresa(empresa);
            }
            
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
}
