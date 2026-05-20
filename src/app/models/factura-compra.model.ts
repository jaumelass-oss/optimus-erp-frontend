import { EstadoFactura } from './factura.model';

export interface LineaFacturaCompraRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  activoId?: number | null;
}

export interface LineaFacturaCompraResponse {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  activoId?: number;
  activoNombre?: string;
}

export interface FacturaCompraRequest {
  proveedor?: string;
  fechaEmision: string;
  ivaPorcentaje: number;
  notas?: string;
  lineas: LineaFacturaCompraRequest[];
}

export interface FacturaCompraResponse {
  id: number;
  numeroFactura: string;
  proveedor?: string;
  fechaEmision: string;
  fechaPago?: string | null;
  estado: EstadoFactura;
  baseImponible: number;
  ivaPorcentaje: number;
  totalEur: number;
  notas?: string;
  lineas: LineaFacturaCompraResponse[];
}