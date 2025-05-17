import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarAgendamentosPage } from './listar-agendamentos.page';

describe('ListarAgendamentosPage', () => {
  let component: ListarAgendamentosPage;
  let fixture: ComponentFixture<ListarAgendamentosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarAgendamentosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
