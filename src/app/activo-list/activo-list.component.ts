import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivoService } from '../activo.service';
import { Activo } from '../activo.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-activo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activo-list.component.html',
  styleUrls: ['./activo-list.component.css']
})
export class ActivoListComponent implements OnInit {
  activos: Activo[] = [];

  nuevoActivo: Activo = {
    nombre: '',
    numero_serie: '',
    tipo: 'LAPTOP',
    valor: 0,
    stock: 0
  }

  constructor(private service: ActivoService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarActivos();
  }

  cargarActivos(): void {
    this.service.getActivos().subscribe({
      next: (data) => {
        this.activos = data;
        this.cdr.detectChanges();
      }
    });
  }

  guardar() {
    this.service.crearActivo(this.nuevoActivo).subscribe(() => {
      this.cargarActivos();
      this.nuevoActivo = {
        nombre: '',
        numero_serie: '',
        tipo: 'LAPTOP',
        valor: 0,
        stock: 0
      };
    });
  }
}