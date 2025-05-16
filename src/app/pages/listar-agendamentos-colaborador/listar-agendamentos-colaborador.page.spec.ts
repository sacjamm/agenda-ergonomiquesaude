import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarAgendamentosColaboradorPage } from './listar-agendamentos-colaborador.page';

describe('ListarAgendamentosColaboradorPage', () => {
  let component: ListarAgendamentosColaboradorPage;
  let fixture: ComponentFixture<ListarAgendamentosColaboradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarAgendamentosColaboradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
