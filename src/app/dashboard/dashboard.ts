import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivoService } from '../services/activo.service';
import { Activo } from '../models/activo.model';

type Vista = 'ambos' | 'ventas' | 'compras';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('vegaChart', { static: false }) chartDiv!: ElementRef<HTMLDivElement>;

  // ── Inventario ──
  stats = {
    totalValor: 0,
    totalUnidades: 0,
    alertaStock: 0,
    categorias: [] as { tipo: string; cantidad: number; valorTotal: number; porcentaje: number }[]
  };

  // ── Facturación ──
  cargandoFacturas = true;
  meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  vista: Vista = 'ambos';

  totalVentas2025  = 0;
  totalVentas2024  = 0;
  totalCompras2025 = 0;
  totalCompras2024 = 0;
  varVentas  = 0;
  varCompras = 0;

  private ventas2025:  number[] = new Array(12).fill(0);
  private ventas2024:  number[] = new Array(12).fill(0);
  private compras2025: number[] = new Array(12).fill(0);
  private compras2024: number[] = new Array(12).fill(0);

  readonly C = {
    v25: '#3b82f6', v24: '#93c5fd',
    c25: '#f59e0b', c24: '#fcd34d',
  };

  constructor(
    private activoService: ActivoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarFacturas();
  }

  ngAfterViewInit(): void {
    if (!this.cargandoFacturas) {
      this.renderVega();
    }
  }

  ngOnDestroy(): void {}

  // ── INVENTARIO ──────────────────────────────────────────────────────────────

  cargarInventario(): void {
    this.activoService.getActivos().subscribe({
      next: activos => { setTimeout(() => this.calcularStats(activos), 0); },
      error: e => console.error('Error activos:', e)
    });
  }

  private calcularStats(activos: Activo[]): void {
    if (!activos?.length) return;

    this.stats.totalValor    = activos.reduce((a, x) => a + (Number(x.valor)||0) * (Number(x.stock)||0), 0);
    this.stats.totalUnidades = activos.reduce((a, x) => a + (Number(x.stock)||0), 0);
    this.stats.alertaStock   = activos.filter(x => (Number(x.stock)||0) < 5).length;

    const grupos = activos.reduce((acc, a) => {
      const tipo = a.tipo || 'General';
      if (!acc[tipo]) acc[tipo] = { valor: 0, cantidad: 0 };
      acc[tipo].cantidad += (Number(a.stock)||0);
      acc[tipo].valor    += (Number(a.valor)||0) * (Number(a.stock)||0);
      return acc;
    }, {} as Record<string, { valor: number; cantidad: number }>);

    this.stats.categorias = Object.keys(grupos).map(tipo => ({
      tipo,
      cantidad:   grupos[tipo].cantidad,
      valorTotal: grupos[tipo].valor,
      porcentaje: this.stats.totalValor > 0
        ? Math.round((grupos[tipo].valor / this.stats.totalValor) * 100) : 0
    }));

    this.cdr.detectChanges();
  }

  // ── FACTURACIÓN ─────────────────────────────────────────────────────────────

  cargarFacturas(): void {
    this.ventas2025  = [42800,38500,51200,47600,63400,0,0,0,0,0,0,0];
    this.ventas2024  = [35200,41800,44700,52100,49300,61800,38200,45600,53400,67200,58900,71400];
    this.compras2025 = [18400,22100,19800,25600,31200,0,0,0,0,0,0,0];
    this.compras2024 = [15600,19800,21400,23200,27800,32400,18900,22700,26100,31500,28400,35600];

    const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
    this.totalVentas2025  = sum(this.ventas2025);
    this.totalVentas2024  = sum(this.ventas2024);
    this.totalCompras2025 = sum(this.compras2025);
    this.totalCompras2024 = sum(this.compras2024);

    this.varVentas  = this.totalVentas2024  > 0
      ? Math.round(((this.totalVentas2025 - this.totalVentas2024)  / this.totalVentas2024)  * 100) : 0;
    this.varCompras = this.totalCompras2024 > 0
      ? Math.round(((this.totalCompras2025 - this.totalCompras2024) / this.totalCompras2024) * 100) : 0;

    this.cargandoFacturas = false;
    this.cdr.detectChanges();

    setTimeout(() => this.renderVega(), 50);
  }

  // ── GRÁFICA (Vega-Lite) ───────────────────────────────────────────────────

  private getDatasets(): { label: string; data: number[]; color: string }[] {
    const all = [
      { label: 'Ventas 2025',  data: this.ventas2025,  color: this.C.v25 },
      { label: 'Ventas 2024',  data: this.ventas2024,  color: this.C.v24 },
      { label: 'Compras 2025', data: this.compras2025, color: this.C.c25 },
      { label: 'Compras 2024', data: this.compras2024, color: this.C.c24 },
    ];
    if (this.vista === 'ventas')  return all.slice(0, 2);
    if (this.vista === 'compras') return all.slice(2);
    return all;
  }

  async renderVega(): Promise<void> {
    const container = this.chartDiv?.nativeElement;
    if (!container) return;

    const datasets = this.getDatasets();

    // Convertir a formato "long" para Vega-Lite
    const values: { mes: string; serie: string; valor: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const mes = this.meses[m];
      for (const ds of datasets) {
        values.push({ mes, serie: ds.label, valor: ds.data[m] || 0 });
      }
    }

    const spec: any = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: 'Facturación 2025 vs 2024',
      width: 'container',
      height: 340,
      autosize: { type: 'fit', contains: 'padding', resize: true },
      padding: { top: 20, left: 26, right: 10, bottom: 48 },
      data: { values },
      mark: { type: 'bar', cornerRadiusEnd: 6 },
      encoding: {
        x: {
          field: 'mes',
          type: 'ordinal',
          sort: { domain: this.meses },
          axis: {
            labelAngle: -35,
            labelAlign: 'right',
            labelFontSize: 12,
            labelFont: 'Poppins, system-ui, sans-serif',
            labelLimit: 100,
            labelOverlap: 'parity',
            title: 'Mes',
            titleFontSize: 12,
            titleFont: 'Poppins, system-ui, sans-serif',
            titlePadding: 8
          }
        },
        y: {
          field: 'valor',
          type: 'quantitative',
          axis: {
            format: 's',
            labelFontSize: 12,
            labelFont: 'Poppins, system-ui, sans-serif',
            title: 'valor',
            titleFontSize: 12,
            titleFont: 'Poppins, system-ui, sans-serif',
            titlePadding: 8
          }
        },
        color: {
          field: 'serie',
          type: 'nominal',
          scale: {
            domain: datasets.map(d => d.label),
            range: datasets.map(d => d.color)
          },
          legend: {
            orient: 'top',
            labelFontSize: 12,
            labelFont: 'Poppins, system-ui, sans-serif',
            title: null,
            symbolType: 'square',
            symbolSize: 80,
            padding: 8
          }
        },
        xOffset: { field: 'serie' }
      },
      config: {
        view: { stroke: 'transparent' },
        axis: {
          domainColor: '#cbd5e1',
          gridColor: '#e2e8f0',
          grid: true,
          tickColor: '#94a3b8',
          labelColor: '#475569',
          titleColor: '#334155'
        }
      }
    };

    try {
      const embedModule: any = await import('vega-embed');
      const vegaEmbed = embedModule.default || embedModule;
      // limpiar contenedor y renderizar
      container.innerHTML = '';
      await vegaEmbed(container, spec, { actions: false, renderer: 'svg' });
    } catch (err) {
      console.error('Error cargando vega-embed:', err);
    }
  }

  cambiarVista(v: Vista): void {
    this.vista = v;
    setTimeout(() => this.renderVega(), 0);
  }

  legendItems(): { label: string; color: string }[] {
    return this.getDatasets().map(d => ({ label: d.label, color: d.color }));
  }

  fmt(n: number): string {
    return '€' + n.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  }

  private fmtCompact(n: number): string {
    if (n >= 1000) return '€' + Math.round(n / 1000) + 'k';
    return '€' + Math.round(n);
  }
}