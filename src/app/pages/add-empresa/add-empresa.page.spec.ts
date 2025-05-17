import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddEmpresaPage } from './add-empresa.page';

describe('AddEmpresaPage', () => {
  let component: AddEmpresaPage;
  let fixture: ComponentFixture<AddEmpresaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEmpresaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
