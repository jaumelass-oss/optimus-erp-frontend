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

  @ViewChild('chartCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── Inventario ──
  stats = {
    totalValor: 0,
    totalUnidades: 0,
    alertaStock: 0,
    categorias: [] as { tipo: string; cantidad: number; valorTotal: number; porcentaje: number }[]
  };

  // ── Facturación ──
  cargandoFacturas = true;
  meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
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
      this.dibujarGrafica();
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

    setTimeout(() => this.dibujarGrafica(), 50);
  }

  // ── GRÁFICA CANVAS NATIVO ───────────────────────────────────────────────────

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

  dibujarGrafica(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth  || 800;
    const H   = canvas.offsetHeight || 320;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const datasets = this.getDatasets();
    const nSeries  = datasets.length;
    const nMeses   = 12;

    const padL = 60, padR = 16, padT = 16, padB = 36;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const allVals = datasets.flatMap(d => d.data);
    const maxVal  = Math.max(...allVals, 1);

    // Líneas de guía horizontales
    const nLines = 5;
    ctx.strokeStyle = 'rgba(15,23,42,0.06)';
    ctx.lineWidth   = 1;
    ctx.fillStyle   = '#94a3b8';
    ctx.font        = '11px system-ui, sans-serif';
    ctx.textAlign   = 'right';

    for (let i = 0; i <= nLines; i++) {
      const v = (maxVal / nLines) * i;
      const y = padT + chartH - (chartH * i / nLines);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(this.fmtCompact(v), padL - 6, y + 4);
    }

    // Barras con gradiente
    const groupW = chartW / nMeses;
    const barGap = 2;
    const barW   = Math.max(2, (groupW - barGap * (nSeries + 1)) / nSeries);

    for (let m = 0; m < nMeses; m++) {
      const groupX = padL + m * groupW;

      for (let s = 0; s < nSeries; s++) {
        const val  = datasets[s].data[m] || 0;
        const barH = val > 0 ? Math.max(2, (val / maxVal) * chartH) : 0;
        const x    = groupX + barGap + s * (barW + barGap);
        const y    = padT + chartH - barH;

        // Gradiente principal
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, datasets[s].color);
        grad.addColorStop(1, datasets[s].color + '55');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [6, 6, 0, 0]);
        ctx.fill();

        // Brillo superior
        if (barH > 10) {
          const shine = ctx.createLinearGradient(x, y, x, y + barH * 0.3);
          shine.addColorStop(0, 'rgba(255,255,255,0.25)');
          shine.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = shine;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH * 0.3, [6, 6, 0, 0]);
          ctx.fill();
        }
      }

      // Label mes
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.font      = '11px system-ui, sans-serif';
      ctx.fillText(this.meses[m], groupX + groupW / 2, H - padB + 16);
    }
  } // ← cierra dibujarGrafica()

  cambiarVista(v: Vista): void {
    this.vista = v;
    setTimeout(() => this.dibujarGrafica(), 0);
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