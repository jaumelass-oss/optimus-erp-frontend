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
  empleadoDetalle: Empleado | null = null;
  vista: 'lista' | 'form' | 'detalle' = 'lista';
  notificacion = '';
  modoEdicion = false;
  empleadoEditandoId: number | null = null;
  filtroBuscar = '';
  filtroDepartamento: number | '' = '';

  nuevoEmpleado: Empleado = this.empleadoVacio();

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

  // ── Navegación ───────────────────────────────────────────────

  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.empleadoEditandoId = null;
    this.nuevoEmpleado = this.empleadoVacio();
    this.vista = 'form';
  }

  abrirEdicion(e: Empleado): void {
    this.modoEdicion = true;
    this.empleadoEditandoId = e.id!;
    this.nuevoEmpleado = { ...e };
    this.vista = 'form';
  }

  verDetalle(e: Empleado): void {
    this.empleadoDetalle = e;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.empleadoDetalle = null;
    this.modoEdicion = false;
    this.empleadoEditandoId = null;
    this.nuevoEmpleado = this.empleadoVacio();
  }

  // ── CRUD ─────────────────────────────────────────────────────

  guardar(): void {
    if (!this.nuevoEmpleado.nombre || !this.nuevoEmpleado.apellidos) return;

    const op = this.modoEdicion && this.empleadoEditandoId !== null
      ? this.empleadoService.actualizar(this.empleadoEditandoId, this.nuevoEmpleado)
      : this.empleadoService.crear(this.nuevoEmpleado);

    op.subscribe({
      next: () => {
        this.cargarEmpleados();
        this.volverALista();
        this.mostrarNotif(this.modoEdicion ? 'Empleado actualizado' : 'Empleado creado');
      },
      error: e => console.error(e)
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este empleado?')) return;
    this.empleadoService.eliminar(id).subscribe({
      next: () => {
        this.cargarEmpleados();
        this.volverALista();
        this.mostrarNotif('Empleado eliminado');
      },
      error: e => console.error(e)
    });
  }

  // ── Filtros ──────────────────────────────────────────────────

  aplicarFiltros(): void { this.cargarEmpleados(); }

  limpiarFiltros(): void {
    this.filtroBuscar = '';
    this.filtroDepartamento = '';
    this.cargarEmpleados();
  }

  // ── Helpers ──────────────────────────────────────────────────

  mostrarNotif(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }

  inicialesEmpleado(e: Empleado): string {
    return (e.nombre[0] + e.apellidos[0]).toUpperCase();
  }

  private empleadoVacio(): Empleado {
    return { nombre: '', apellidos: '', emailCorporativo: '', departamentoId: null, tarifaHora: 0 };
  }
}