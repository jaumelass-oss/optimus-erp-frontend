import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturaService } from '../services/factura.service';
import { ClienteService } from '../services/cliente.service';
import { ActivoService } from '../services/activo.service';
import { FacturaPdfService } from '../services/factura-pdf.service';
import { Activo } from '../models/activo.model';
import { Cliente } from '../models/cliente.model';
import {
  EstadoFactura, FacturaRequest, FacturaResponse,
  LineaFacturaRequest, LineaFacturaResponse
} from '../models/factura.model';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';


@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factura-list.component.html',
  styleUrl: './factura-list.component.css'
})
export class FacturaListComponent implements OnInit {

  facturas: FacturaResponse[] = [];
  clientes: Cliente[] = [];
  activos: Activo[] = [];
  serviciosInventario: string[] = [];
  notificacion = '';
  empresaEmail = 'facturacion@optimus-erp.com';

  vista: 'lista' | 'form' | 'detalle' = 'lista';
  facturaDetalle: FacturaResponse | null = null;
  modoEdicion = false;
  facturaEditandoId: number | null = null;

  filtroEstado: EstadoFactura | '' = '';
  estados: EstadoFactura[] = ['BORRADOR', 'EMITIDA', 'PAGADA', 'CANCELADA'];

  nuevaFactura: FacturaRequest = {
    clienteId: 0,
    fechaEmision: new Date().toISOString().split('T')[0],
    ivaPorcentaje: 21,
    lineas: []
  };

  constructor(
    private facturaService: FacturaService,
    private clienteService: ClienteService,
    private activoService: ActivoService,
    private facturaPdfService: FacturaPdfService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
    this.clienteService.listar().subscribe(data => this.clientes = data);
    this.cargarActivosInventario();
  }

  cargarActivosInventario(): void {
    this.activoService.getActivos().subscribe({
      next: data => {
        this.activos = data;
        this.serviciosInventario = Array.from(new Set(data.map(a => a.nombre)));
      },
      error: err => console.error('Error cargando activos', err)
    });
  }

  cargarFacturas(): void {
    const obs = this.filtroEstado
      ? this.facturaService.listarPorEstado(this.filtroEstado as EstadoFactura)
      : this.facturaService.listar();

    obs.subscribe({
      next: data => this.facturas = data,
      error: err => console.error('Error cargando facturas', err)
    });
  }

  aplicarFiltro(): void {
    this.cargarFacturas();
  }


  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.facturaEditandoId = null;
    this.nuevaFactura = {
      clienteId: 0,
      fechaEmision: new Date().toISOString().split('T')[0],
      ivaPorcentaje: 21,
      lineas: []
    };
    this.agregarLinea();
    this.vista = 'form';
  }

  abrirEdicion(f: FacturaResponse): void {
    this.modoEdicion = true;
    this.facturaEditandoId = f.id;
    this.nuevaFactura = {
      clienteId: f.clienteId,
      fechaEmision: f.fechaEmision,
      ivaPorcentaje: f.ivaPorcentaje,
      lineas: f.lineas.map(l => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
        activoId: l.activoId ?? null
      }))
    };
    this.vista = 'form';
  }

  verDetalle(f: FacturaResponse): void {
    this.facturaDetalle = f;
    this.vista = 'detalle';
  }

  volverALista(): void {
    this.vista = 'lista';
    this.facturaDetalle = null;
  }


  agregarLinea(): void {
    this.nuevaFactura.lineas.push({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      activoId: null
    });
  }

  eliminarLinea(idx: number): void {
    this.nuevaFactura.lineas.splice(idx, 1);
  }

  actualizarPrecioDescripcion(linea: LineaFacturaRequest): void {
    const descripcion = linea.descripcion?.trim().toLowerCase() || '';
    if (!descripcion) {
      linea.precioUnitario = 0;
      linea.activoId = null;
      return;
    }

    const activo = this.activos.find(a => a.nombre.trim().toLowerCase() === descripcion);
    if (activo) {
      linea.precioUnitario = activo.valor;
      linea.activoId = activo.id ?? null;
    } else {
      linea.activoId = null;
    }
  }

  private construirFacturaResponseDesdeDraft(): FacturaResponse {
    const cliente = this.clientes.find(c => c.id === this.nuevaFactura.clienteId);
    const lineas: LineaFacturaResponse[] = this.nuevaFactura.lineas.map(l => ({
      id: 0,
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      subtotal: +(l.cantidad * l.precioUnitario).toFixed(2),
      activoId: l.activoId ?? undefined
    }));

    const base = +lineas.reduce((acc, linea) => acc + linea.subtotal, 0).toFixed(2);
    const total = +(base + base * (this.nuevaFactura.ivaPorcentaje / 100)).toFixed(2);

    return {
      id: this.facturaEditandoId ?? 0,
      numeroFactura: this.modoEdicion ? `FACT-${this.facturaEditandoId ?? 'DRAFT'}` : 'FACT-0000',
      clienteId: this.nuevaFactura.clienteId,
      clienteRazonSocial: cliente?.razonSocial ?? 'Cliente no seleccionado',
      clienteCif: cliente?.cifVies ?? 'N/A',
      clienteEmail: cliente?.emailFacturacion ?? 'cliente@ejemplo.com',
      fechaEmision: this.nuevaFactura.fechaEmision,
      estado: 'BORRADOR',
      baseImponible: base,
      ivaPorcentaje: this.nuevaFactura.ivaPorcentaje,
      totalEur: total,
      lineas
    };
  }

  generarPdf(factura: FacturaResponse | FacturaRequest): void {
    const facturaExportar = 'numeroFactura' in factura
      ? factura
      : this.construirFacturaResponseDesdeDraft();

    this.facturaPdfService.generar(facturaExportar, this.empresaEmail);
  }

  private reducirStockDeFactura(factura: FacturaResponse) {
    const actualizaciones = factura.lineas
      .filter(linea => linea.activoId != null && linea.cantidad > 0)
      .map(linea => {
        const activo = this.activos.find(a => a.id === linea.activoId);
        if (!activo) {
          return of(null);
        }

        const actualizado: Activo = {
          ...activo,
          stock: Math.max(0, activo.stock - linea.cantidad)
        };

        return this.activoService.actualizarActivo(actualizado).pipe(
          tap(res => {
            const idx = this.activos.findIndex(a => a.id === res.id);
            if (idx !== -1) {
              this.activos[idx] = res;
            }
          })
        );
      });

    return actualizaciones.length ? forkJoin(actualizaciones) : of(null);
  }

  calcularSubtotalLinea(linea: LineaFacturaRequest): number {
    return +(linea.cantidad * linea.precioUnitario).toFixed(2);
  }

  calcularBaseImponible(): number {
    return +this.nuevaFactura.lineas
      .reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0)
      .toFixed(2);
  }

  calcularTotalConIva(): number {
    const base = this.calcularBaseImponible();
    const iva  = base * (this.nuevaFactura.ivaPorcentaje / 100);
    return +(base + iva).toFixed(2);
  }


  guardar(): void {
    if (!this.nuevaFactura.clienteId || this.nuevaFactura.lineas.length === 0) return;

    const op = this.modoEdicion && this.facturaEditandoId !== null
      ? this.facturaService.actualizar(this.facturaEditandoId, this.nuevaFactura)
      : this.facturaService.crear(this.nuevaFactura);

    op.subscribe({
      next: () => {
        this.cargarFacturas();
        this.volverALista();
        this.mostrarNotificacion(this.modoEdicion ? 'Factura actualizada' : 'Factura creada');
      },
      error: err => console.error('Error guardando factura', err)
    });
  }


  cambiarEstado(id: number, estado: EstadoFactura): void {
    const cambio$ = estado === 'EMITIDA'
      ? this.facturaService.buscarPorId(id).pipe(
          switchMap(factura => this.reducirStockDeFactura(factura)),
          switchMap(() => this.facturaService.cambiarEstado(id, estado))
        )
      : this.facturaService.cambiarEstado(id, estado);

    cambio$.subscribe({
      next: () => {
        this.cargarFacturas();
        this.cargarActivosInventario();
        this.mostrarNotificacion(`Factura marcada como ${estado}`);
      },
      error: err => console.error('Error cambiando estado', err)
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar esta factura? Solo es posible en estado BORRADOR.')) return;
    this.facturaService.eliminar(id).subscribe({
      next: () => {
        this.cargarFacturas();
        this.mostrarNotificacion('Factura eliminada');
      },
      error: err => console.error('Error eliminando factura', err)
    });
  }


  mostrarNotificacion(msg: string): void {
    this.notificacion = msg;
    setTimeout(() => this.notificacion = '', 3000);
  }

  badgeClass(estado: EstadoFactura): string {
    return {
      BORRADOR:  'badge-borrador',
      EMITIDA:   'badge-emitida',
      PAGADA:    'badge-pagada',
      CANCELADA: 'badge-cancelada'
    }[estado] ?? '';
  }

  transicionesPosibles(estado: EstadoFactura): EstadoFactura[] {
    return {
      BORRADOR:  ['EMITIDA', 'CANCELADA'],
      EMITIDA:   ['PAGADA', 'CANCELADA'],
      PAGADA:    [],
      CANCELADA: []
    }[estado] as EstadoFactura[];
  }
}