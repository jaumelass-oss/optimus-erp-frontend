import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { ActivoListComponent } from './activo-list/activo-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventario', component: ActivoListComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];