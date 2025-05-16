import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAgendamentoColaboradorPage } from './add-agendamento-colaborador.page';

describe('AddAgendamentoColaboradorPage', () => {
  let component: AddAgendamentoColaboradorPage;
  let fixture: ComponentFixture<AddAgendamentoColaboradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAgendamentoColaboradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
