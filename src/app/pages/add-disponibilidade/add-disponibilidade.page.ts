import { Component, OnInit, ViewChild } from '@angular/core';
import { PreferencesService } from 'src/app/services/preferences.service';
import { Router } from '@angular/router';
import { AlertController, IonSelect, IonInput } from '@ionic/angular';

@Component({
  selector: 'app-add-disponibilidade',
  templateUrl: './add-disponibilidade.page.html',
  styleUrls: ['./add-disponibilidade.page.scss'],
  standalone: false,
})
export class AddDisponibilidadePage implements OnInit {

  @ViewChild('inputprofissionalSelected') inputprofissionalSelected!: IonSelect;
  @ViewChild('inputempresaSearch') inputempresaSearch!: IonInput;

  public profissional_id: number = 0;
  public empresa_id: number = 0;

  formSubmetido = false;
  profissionalSelected: number = 0;

  public isAdmin = false;
  public isProfissional = false;
  profissionais: any[] = [];

  empresaSearch: string = '';
  horaManhaInicio:string='06:00';
  horaManhaFim:string='12:00';
  horaTardeInicio:string='13:00';
  horaTardeFim:string='19:00';

  intervalo: number = 20;

  public empresasFiltradas: any[] = [];
  public empresaSelecionada: any = null;

  constructor(
    private preferencesService: PreferencesService,
    private router: Router, private alertController: AlertController
  ) { }

  async ngOnInit() {
    const userLogado = await this.preferencesService.getUsuarioLogado();
    if (userLogado?.nivel === 'admin') {
      this.isAdmin = true;
      this.isProfissional = false;
      await this.listaProfissionais();
    } else if (userLogado?.nivel === 'funcionario') {
      this.isAdmin = false;
      this.isProfissional = true;
    } else {
      this.isAdmin = false;
      this.isProfissional = false;
    }
  }

  async listaProfissionais() {
    try {
      const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors', // Parâmetro CORS
        body: JSON.stringify({
          action: 'listar_usuarios'
        })
      });

      const data = await response.json();

      if (data.status === 200 && data.usuarios) {
        this.profissionais = data.usuarios;
      } else {
        this.profissionais = [];
      }
    } catch (error) {
      alert('Erro ao conectar ao servidor.');
      this.profissionais = [];
    }
  }

  async onProfissionalChange(event?: any) {
    this.profissionalSelected = event.detail.value;

    this.profissional_id = this.profissionalSelected;
    console.log(this.profissionalSelected);
  }

  async buscarEmpresas(event: any) {
    if (!this.profissionalSelected || this.profissionalSelected <= 0) {
      this.formSubmetido = true;
      const empresaInput = await this.inputempresaSearch.getInputElement();
      empresaInput.blur();
      await this.inputprofissionalSelected.open();
      this.presentAlert('Selecione um profissional primeiro.');
      this.empresaSearch = '';
      return;
    }
    const valor = event.target.value?.trim() || '';
    this.empresaSelecionada = null;
    this.empresasFiltradas = [];

    if (valor.length < 3) return;

    // Chame seu endpoint para buscar empresas
    const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/agenda.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'buscar_empresas',
        query: valor
      })
    });
    const data = await response.json();
    if (data.status === 200 && data.empresas) {
      this.empresasFiltradas = data.empresas;
    }
  }

  selecionarEmpresa(empresa: any) {
    this.empresa_id = empresa.id;
    this.profissional_id = this.profissionalSelected || 0;

    this.empresaSelecionada = empresa;
    this.empresaSearch = empresa.razao_social;
    this.empresasFiltradas = [];
    console.log(this.profissional_id);
  }

  async aoLimparEmpresa(input: any) {
  this.empresaSearch = '';
  this.empresasFiltradas = [];
  this.empresaSelecionada = null;
  this.empresa_id = 0;

  const nativeInput = await input.getInputElement();
  nativeInput.blur(); // Remove o foco do input

  console.log('Campo limpo e desfocado.');
}

  async presentAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

}
