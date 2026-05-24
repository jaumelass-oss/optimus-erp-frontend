import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartamentoService } from '../services/departamento.service';
import { Departamento } from '../models/rrhh.model';

@Component({
  selector: 'app-departamento-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamento-list.component.html',
  styleUrl: './departamento-list.component.css'
})
export class DepartamentoListComponent implements OnInit {

  departamentos: Departamento[] = [];
  departamentosFiltrados: Departamento[] = [];
  deptDetalle: Departamento | null = null;
  vista: 'lista' | 'form' | 'detalle' = 'lista';
  notificacion = '';
  modoEdicion = false;
  editandoId: number | null = null;
  filtroBuscar = '';

  nuevo: Departamento = { nombre: '' };

  constructor(private departamentoService: DepartamentoService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.departamentoService.listar().subscribe({
      next: d => {
        this.departamentos = d;
        this.aplicarFiltro();
      },
      error: e => console.error(e)
    });
  }

  aplicarFiltro(): void {
    const q = this.filtroBuscar.trim().toLowerCase();
    this.departamentosFiltrados = q
      ? this.departamentos.filter(d => d.nombre.toLowerCase().includes(q))
      : [...this.departamentos];
  }

  limpiarFiltro(): void {
    this.filtroBuscar = '';
    this.aplicarFiltro();
  }

  // ── Navegación ───────────────────────────────────────────────

  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.editandoId = null;
    this.nuevo = { nombre: '' };
    this.vista = 'form';
  }

  abrirEdicion(d: Departamento): void {
    this.modoEdicion = true;
    this.editandoId = d.id!;
    this.nuevo = { ...d };
    this.vista = 'form';
  }

  verDetalle(d: Departamento): void {
    this.deptDetalle = d;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.deptDetalle = null;
    this.modoEdicion = false;
    this.editandoId = null;
    this.nuevo = { nombre: '' };
  }

  // ── CRUD ─────────────────────────────────────────────────────

  guardar(): void {
    if (!this.nuevo.nombre) return;
    const op = this.modoEdicion && this.editandoId !== null
      ? this.departamentoService.actualizar(this.editandoId, this.nuevo)
      : this.departamentoService.crear(this.nuevo);

    op.subscribe({
      next: () => {
        this.cargar();
        this.volverALista();
        this.mostrarNotif(this.modoEdicion ? 'Departamento actualizado' : 'Departamento creado');
      },
      error: e => console.error(e)
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este departamento?')) return;
    this.departamentoService.eliminar(id).subscribe({
      next: () => {
        this.cargar();
        this.volverALista();
        this.mostrarNotif('Departamento eliminado');
      },
      error: e => alert(e?.error?.message || 'No se puede eliminar: tiene empleados asignados.')
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  mostrarNotif(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }
}