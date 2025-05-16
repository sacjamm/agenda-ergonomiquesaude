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
  horaManhaInicio: string = '06:00';
  horaManhaFim: string = '12:00';
  horaTardeInicio: string = '13:00';
  horaTardeFim: string = '19:00';

  intervalo: number = 20;

  datasInput: any[] = [];
  horarios: any[] = [];

  mostrarManha: boolean = false;
  mostrarTarde: boolean = false;

  public empresasFiltradas: any[] = [];
  public empresaSelecionada: any = null;

  public datasDisponiveis: { data: string, label: string, mes: string }[] = [];
  public mesesDisponiveis: { mes: string, label: string, datas: string[] }[] = [];
  public datas: string[] = [];
  public mesesSelecionados: string[] = [];

  public horariosDisponiveis: any[] = []; // todos os horários gerados
  public horariosSelecionados: any[] = []; // apenas os horários escolhidos

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
      this.gerarDatasProximosMeses(2);
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
    nativeInput.blur();
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

  private gerarHorariosEntre(inicio: string, fim: string, intervalo: number): string[] {
    const horarios: string[] = [];
    let [h, m] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);

    while (h < hFim || (h === hFim && m <= mFim)) {
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      horarios.push(horaStr);
      m += Number(intervalo); // Garante que é número
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
    }
    return horarios;
  }

  atualizarHorariosDisponiveis() {
    if (!this.datas || this.datas.length === 0) {
      this.horariosDisponiveis = [];
      return;
    }

    let horariosGerados: any[] = [];

    for (const data of this.datas) {
      let horariosData: string[] = [];

      if (this.mostrarManha) {
        horariosData = horariosData.concat(
          this.gerarHorariosEntre(this.horaManhaInicio, this.horaManhaFim, this.intervalo)
        );
      }
      if (this.mostrarTarde) {
        horariosData = horariosData.concat(
          this.gerarHorariosEntre(this.horaTardeInicio, this.horaTardeFim, this.intervalo)
        );
      }

      // Para cada horário, monte o objeto detalhado para envio posterior
      horariosGerados = horariosGerados.concat(
        horariosData.map(hora => ({
          data_horarios: data,
          hora: hora,
          empresa_id: this.empresa_id,
          profissional_id: this.profissional_id,
          intervalo_hora: this.intervalo
        }))
      );
    }

    this.horariosDisponiveis = horariosGerados;
    // Se quiser selecionar todos automaticamente:
    this.horariosSelecionados = [...this.horariosDisponiveis];
  }

  gerarDatasProximosMeses(qtdMeses: number = 3) {
    const hoje = new Date();
    this.datasDisponiveis = [];
    this.mesesDisponiveis = [];

    for (let m = 0; m < qtdMeses; m++) {
      const dataBase = new Date(hoje.getFullYear(), hoje.getMonth() + m, 1);
      const mes = dataBase.toLocaleString('default', { month: 'long', year: 'numeric' });
      const datasMes: string[] = [];

      let dia = 1;
      while (true) {
        const dataAtual = new Date(dataBase.getFullYear(), dataBase.getMonth(), dia);
        if (dataAtual.getMonth() !== dataBase.getMonth()) break;
        /*if (m === 0 && dataAtual < hoje) { dia++; continue; } // só datas futuras no mês atual*/
        if (m === 0) {
          // Ignora datas antes de hoje (considerando só ano, mês, dia)
          const dataAtualSemHora = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());
          const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
          if (dataAtualSemHora < hojeSemHora) { dia++; continue; }
        }

        const dataStr = dataAtual.toISOString().slice(0, 10);
        const label = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        this.datasDisponiveis.push({ data: dataStr, label, mes });
        datasMes.push(dataStr);
        dia++;
      }
      this.mesesDisponiveis.push({ mes, label: mes.charAt(0).toUpperCase() + mes.slice(1), datas: datasMes });
    }
  }

  toggleMes(mes: { mes: string, datas: string[] }) {
    const todasSelecionadas = mes.datas.every(d => this.datas.includes(d));
    if (todasSelecionadas) {
      // Desmarca todas do mês
      this.datas = this.datas.filter(d => !mes.datas.includes(d));
    } else {
      // Marca todas do mês (sem duplicar)
      this.datas = Array.from(new Set([...this.datas, ...mes.datas]));
    }
    this.atualizarHorariosDisponiveis();
  }

  isMesSelecionado(mes: { mes: string, datas: string[] }) {
    return mes.datas.every(d => this.datas.includes(d));
  }

  getDatasDoMes(mes: string) {
    return this.datasDisponiveis.filter(d => d.mes === mes);
  }

  getHorariosAgrupados() {
    // Retorna um array: [{ data, horariosManha: [], horariosTarde: [] }]
    const agrupados: any[] = [];
    const datasSelecionadas = this.datas || [];

    for (const data of datasSelecionadas) {
      const horariosData = this.horariosDisponiveis.filter(h => h.data_horarios === data);
      const horariosManha = horariosData.filter(h => h.hora < '12:00');
      const horariosTarde = horariosData.filter(h => h.hora >= '12:00');
      agrupados.push({
        data,
        horariosManha,
        horariosTarde
      });
    }
    return agrupados;
  }

  async salvarDisponibilidade() {
  // Validação básica
  if (
    !this.empresa_id ||
    !this.profissional_id ||
    !this.datas ||
    this.datas.length === 0 ||
    !this.horariosSelecionados ||
    this.horariosSelecionados.length === 0
  ) {
    this.presentAlert('Preencha todos os campos obrigatórios e selecione pelo menos um horário.');
    return;
  }

  // Monta os dados conforme a endpoint espera
  const payload = {
    action: 'salvar_disponibilidade',
    empresa_id: this.empresa_id,
    profissional_id: this.profissional_id,
    intervalo: this.intervalo,
    datas: this.datas,
    horarios_json: JSON.stringify(this.horariosSelecionados),
    horarios_detalhados: this.horariosSelecionados
  };

  try {
    const response = await fetch('https://api.ergonomiquesaude.com.br/api/agenda/disponibilidade.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.status === 200) {
      // Limpa o formulário
      this.empresa_id = 0;
      this.profissional_id = 0;
      this.profissionalSelected = 0;
      this.empresaSearch = '';
      this.empresaSelecionada = null;
      this.datas = [];
      this.horariosDisponiveis = [];
      this.horariosSelecionados = [];
      this.mostrarManha = false;
      this.mostrarTarde = false;
      // Redireciona para a tela desejada (ajuste a rota conforme necessário)
      this.presentAlert('Disponibilidade salva com sucesso!').then(() => {
        this.router.navigate(['/listar-disponibilidades']);
      });
    } else {
      this.presentAlert(data.message || 'Erro ao salvar disponibilidade.');
    }
  } catch (error) {
    this.presentAlert('Erro ao conectar ao servidor.');
  }
}

}
