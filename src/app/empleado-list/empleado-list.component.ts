import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../services/empleado.service';
import { DepartamentoService } from '../services/departamento.service';
import { Empleado, Departamento } from '../models/rrhh.model';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleado-list.component.html',
  styleUrl: './empleado-list.component.css'
})
export class EmpleadoListComponent implements OnInit {

  empleados: Empleado[] = [];
  departamentos: Departamento[] = [];
  notificacion = '';

  mostrarFormulario = false;
  modoEdicion = false;
  empleadoEditandoId: number | null = null;

  filtroBuscar = '';
  filtroDepartamento: number | '' = '';

  nuevoEmpleado: Empleado = {
    nombre: '', apellidos: '', emailCorporativo: '',
    departamentoId: null, tarifaHora: 0
  };

  constructor(
    private empleadoService: EmpleadoService,
    private departamentoService: DepartamentoService
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
    this.departamentoService.listar().subscribe(d => this.departamentos = d);
  }

  cargarEmpleados(): void {
    const obs = this.filtroBuscar
      ? this.empleadoService.buscar(this.filtroBuscar)
      : this.filtroDepartamento
        ? this.empleadoService.listarPorDepartamento(+this.filtroDepartamento)
        : this.empleadoService.listar();

    obs.subscribe({ next: d => this.empleados = d, error: e => console.error(e) });
  }

  guardar(): void {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.apellidos) return;

    const op = this.modoEdicion && this.empleadoEditandoId !== null
      ? this.empleadoService.actualizar(this.empleadoEditandoId, this.nuevoEmpleado)
      : this.empleadoService.crear(this.nuevoEmpleado);

    op.subscribe({
      next: () => {
        this.cargarEmpleados();
        this.resetFormulario();
        this.mostrarNotif(this.modoEdicion ? 'Empleado actualizado' : 'Empleado creado');
      },
      error: e => console.error(e)
    });
  }

  prepararEdicion(e: Empleado): void {
    this.modoEdicion = true;
    this.empleadoEditandoId = e.id!;
    this.nuevoEmpleado = { ...e };
    this.mostrarFormulario = true;
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este empleado?')) return;
    this.empleadoService.eliminar(id).subscribe({
      next: () => { this.cargarEmpleados(); this.mostrarNotif('Empleado eliminado'); },
      error: e => console.error(e)
    });
  }

  resetFormulario(): void {
    this.nuevoEmpleado = { nombre: '', apellidos: '', emailCorporativo: '', departamentoId: null, tarifaHora: 0 };
    this.modoEdicion = false;
    this.empleadoEditandoId = null;
    this.mostrarFormulario = false;
  }

  aplicarFiltros(): void { this.cargarEmpleados(); }

  limpiarFiltros(): void {
    this.filtroBuscar = '';
    this.filtroDepartamento = '';
    this.cargarEmpleados();
  }

  mostrarNotif(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }

  inicialesEmpleado(e: Empleado): string {
    return (e.nombre[0] + e.apellidos[0]).toUpperCase();
  }
}