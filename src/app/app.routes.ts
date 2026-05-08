import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { ActivoListComponent } from './activo-list/activo-list.component';
import { FacturaListComponent } from './factura-list/factura-list.component';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { EmpleadoListComponent }       from './empleado-list/empleado-list.component';
import { DepartamentoListComponent }   from './departamento-list/departamento-list.component';

export const routes: Routes = [
  { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'inventario',     component: ActivoListComponent },
  { path: 'facturas',       component: FacturaListComponent },
  { path: 'clientes',       component: ClienteListComponent },
  { path: 'empleados',      component: EmpleadoListComponent },
  { path: 'departamentos',  component: DepartamentoListComponent },
];