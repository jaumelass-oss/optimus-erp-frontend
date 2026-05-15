import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivoService } from '../services/activo.service';
import { ClienteService } from '../services/cliente.service';
import { Activo } from '../models/activo.model';
import { Cliente } from '../models/cliente.model';

@Component({
  selector: 'app-activo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activo-list.component.html',
  styleUrls: ['./activo-list.component.css']
})
export class ActivoListComponent implements OnInit {

  activos: Activo[] = [];
  clientes: Cliente[] = [];
  notificacion = '';

  vista: 'lista' | 'detalle' = 'lista';
  activoDetalle: Activo | null = null;
  modoEdicion = false;
  activoEditandoId: number | null = null;

  nuevoActivo: Activo = this.activoVacio();

  constructor(
    private activoService: ActivoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    this.cargarActivos();
    this.clienteService.listar().subscribe(c => this.clientes = c);
  }

  cargarActivos(): void {
    this.activoService.getActivos().subscribe({
      next: d => this.activos = d,
      error: e => console.error(e)
    });
  }

  guardar(): void {
    if (!this.nuevoActivo.nombre) return;

    const op = this.modoEdicion && this.activoEditandoId !== null
      ? this.activoService.actualizarActivo(this.nuevoActivo)
      : this.activoService.crearActivo(this.nuevoActivo);

    op.subscribe({
      next: () => {
        this.cargarActivos();
        this.resetFormulario();
        this.mostrarNotif(this.modoEdicion ? 'Activo actualizado' : 'Activo añadido');
        if (this.vista === 'detalle') this.volverALista();
      },
      error: e => console.error(e)
    });
  }

  prepararEdicion(a: Activo): void {
    this.modoEdicion = true;
    this.activoEditandoId = a.id!;
    this.nuevoActivo = { ...a };
    this.vista = 'lista';
  }

  cancelarEdicion(): void {
    this.resetFormulario();
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este activo?')) return;
    this.activoService.eliminarActivo(id).subscribe({
      next: () => {
        this.cargarActivos();
        this.mostrarNotif('Activo eliminado');
      },
      error: e => console.error(e)
    });
  }

  verDetalle(a: Activo): void {
    this.activoDetalle = a;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.activoDetalle = null;
  }

  resetFormulario(): void {
    this.nuevoActivo = this.activoVacio();
    this.modoEdicion = false;
    this.activoEditandoId = null;
  }

  mostrarNotif(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }

  private activoVacio(): Activo {
    return {
      nombre: '',
      numero_serie: '',
      valor: 0,
      stock: 0,
      fechaEntrada: new Date().toISOString().split('T')[0],
      clienteVendidoId: null,
      fechaVenta: null,
      notas: ''
    };
  }
}