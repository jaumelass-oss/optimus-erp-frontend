import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartamentoService } from '../services/departamento.service';
import { Departamento, Sede } from '../models/rrhh.model';
 
@Component({
  selector: 'app-departamento-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departamento-list.component.html',
  styleUrl: './departamento-list.component.css'
})
export class DepartamentoListComponent implements OnInit {
 
  departamentos: Departamento[] = [];
  sedes: Sede[] = ['VALENCIA', 'RUMANIA', 'ALEMANIA'];
  notificacion = '';
  mostrarFormulario = false;
  modoEdicion = false;
  editandoId: number | null = null;
 
  nuevo: Departamento = { nombre: '', sede: 'VALENCIA' };
 
  constructor(private departamentoService: DepartamentoService) {}
 
  ngOnInit(): void { this.cargar(); }
 
  cargar(): void {
    this.departamentoService.listar().subscribe({ next: d => this.departamentos = d, error: e => console.error(e) });
  }
 
  guardar(): void {
    if (!this.nuevo.nombre) return;
    const op = this.modoEdicion && this.editandoId !== null
      ? this.departamentoService.actualizar(this.editandoId, this.nuevo)
      : this.departamentoService.crear(this.nuevo);
 
    op.subscribe({
      next: () => { this.cargar(); this.reset(); this.mostrarNotif(this.modoEdicion ? 'Departamento actualizado' : 'Departamento creado'); },
      error: e => console.error(e)
    });
  }
 
  prepararEdicion(d: Departamento): void {
    this.modoEdicion = true;
    this.editandoId = d.id!;
    this.nuevo = { ...d };
    this.mostrarFormulario = true;
  }
 
  eliminar(id: number): void {
    if (!confirm('¿Eliminar este departamento?')) return;
    this.departamentoService.eliminar(id).subscribe({
      next: () => { this.cargar(); this.mostrarNotif('Departamento eliminado'); },
      error: (e) => alert(e?.error?.message || 'No se puede eliminar: tiene empleados asignados.')
    });
  }
 
  reset(): void { this.nuevo = { nombre: '', sede: 'VALENCIA' }; this.modoEdicion = false; this.editandoId = null; this.mostrarFormulario = false; }
  mostrarNotif(msg: string): void { this.notificacion = msg; setTimeout(() => this.notificacion = '', 3000); }
  sedeBadge(s: Sede): string { return { VALENCIA: 'badge-valencia', RUMANIA: 'badge-rumania', ALEMANIA: 'badge-alemania' }[s]; }
}