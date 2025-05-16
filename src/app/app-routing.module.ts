import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'folder/inbox',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'listar-agendamentos-colaborador',
    loadChildren: () => import('./pages/listar-agendamentos-colaborador/listar-agendamentos-colaborador.module').then( m => m.ListarAgendamentosColaboradorPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-agendamento-colaborador',
    loadChildren: () => import('./pages/add-agendamento-colaborador/add-agendamento-colaborador.module').then( m => m.AddAgendamentoColaboradorPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
