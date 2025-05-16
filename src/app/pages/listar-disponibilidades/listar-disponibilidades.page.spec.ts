import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarDisponibilidadesPage } from './listar-disponibilidades.page';

describe('ListarDisponibilidadesPage', () => {
  let component: ListarDisponibilidadesPage;
  let fixture: ComponentFixture<ListarDisponibilidadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarDisponibilidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
