import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDisponibilidadePage } from './add-disponibilidade.page';

describe('AddDisponibilidadePage', () => {
  let component: AddDisponibilidadePage;
  let fixture: ComponentFixture<AddDisponibilidadePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDisponibilidadePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
