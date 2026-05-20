export type EstadoFactura = 'BORRADOR' | 'EMITIDA' | 'PAGADA' | 'CANCELADA';
 
export interface LineaFacturaRequest {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  activoId?: number | null;
}

export interface LineaFacturaResponse {
  id: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  activoId?: number;
  activoNombre?: string;
}
 
export interface FacturaRequest {
  clienteId: number;
  fechaEmision: string;
  ivaPorcentaje: number;
  lineas: LineaFacturaRequest[];
}
 
export interface FacturaResponse {
  id: number;
  numeroFactura: string;
  clienteId: number;
  clienteRazonSocial: string;
  clienteCif?: string;
  clienteEmail?: string;
  fechaEmision: string;
  fechaPago?: string | null;
  estado: EstadoFactura;
  baseImponible: number;
  ivaPorcentaje: number;
  totalEur: number;
  lineas: LineaFacturaResponse[];
}