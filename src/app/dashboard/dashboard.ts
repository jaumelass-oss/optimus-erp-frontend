import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivoService } from '../activo.service';
import { Activo } from '../activo.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  titulo: string = 'Panel de Control - Optimus ERP';
  
  stats = {
    totalValor: 0,
    totalUnidades: 0,
    alertaStock: 0
  };

  constructor(
    private service: ActivoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatosDelBackend();
  }

  cargarDatosDelBackend() {
    this.service.getActivos().subscribe({
      next: (activosRecibidos) => {
        setTimeout(() => {
          this.calcularEstadisticas(activosRecibidos);
        }, 0);
      },
      error: (e) => console.error('Error al cargar activos:', e)
    });
  }

  calcularEstadisticas(activos: Activo[]) {
    if (!activos || activos.length === 0) {
      console.log("No han llegado activos todavía");
      return;
    }
  
    this.stats.totalValor = activos.reduce((acc, a) => {
      const v = Number(a.valor) || 0;
      const s = Number(a.stock) || 0;
      return acc + (v * s);
    }, 0);
  
    this.stats.totalUnidades = activos.reduce((acc, a) => acc + (Number(a.stock) || 0), 0);
    
    this.stats.alertaStock = activos.filter(a => (Number(a.stock) || 0) < 5).length;
    
    console.log("Cálculo terminado:", this.stats);

    this.cdr.detectChanges();
  }
}