import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../services/cliente.service';
import { Cliente } from '../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {

  clientes: Cliente[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  clienteEditandoId: number | null = null;
  notificacion = '';

  nuevoCliente: Cliente = {
    razonSocial: '',
    cifVies: '',
    pais: 'España',
    emailFacturacion: ''
  };

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: data => this.clientes = data,
      error: err => console.error('Error cargando clientes', err)
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetFormulario();
  }

  guardar(): void {
    if (!this.nuevoCliente.razonSocial || !this.nuevoCliente.cifVies) return;

    if (this.modoEdicion && this.clienteEditandoId !== null) {
      this.clienteService.actualizar(this.clienteEditandoId, this.nuevoCliente).subscribe({
        next: () => {
          this.cargarClientes();
          this.resetFormulario();
          this.mostrarNotificacion('Cliente actualizado correctamente');
        },
        error: err => console.error('Error actualizando cliente', err)
      });
    } else {
      this.clienteService.crear(this.nuevoCliente).subscribe({
        next: () => {
          this.cargarClientes();
          this.resetFormulario();
          this.mostrarNotificacion('Cliente creado correctamente');
        },
        error: err => console.error('Error creando cliente', err)
      });
    }
  }

  prepararEdicion(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteEditandoId = cliente.id!;
    this.nuevoCliente = { ...cliente };
    this.mostrarFormulario = true;
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este cliente?')) return;
    this.clienteService.eliminar(id).subscribe({
      next: () => {
        this.cargarClientes();
        this.mostrarNotificacion('Cliente eliminado');
      },
      error: err => console.error('Error eliminando cliente', err)
    });
  }

  resetFormulario(): void {
    this.nuevoCliente = { razonSocial: '', cifVies: '', pais: 'España', emailFacturacion: '' };
    this.modoEdicion = false;
    this.clienteEditandoId = null;
    this.mostrarFormulario = false;
  }

  mostrarNotificacion(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }
}