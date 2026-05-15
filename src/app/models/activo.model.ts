export type TipoActivo = 'LAPTOP' | 'PERIFERICO' | 'LICENCIA' | 'SERVIDOR';
 
export interface Activo {
  id?: number;
  nombre: string;
  numero_serie?: string;
  tipo?: TipoActivo;
  valor?: number;
  stock?: number;
  empleadoId?: number;
 
  // Historial
  fechaEntrada?: string;
  clienteVendidoId?: number | null;
  clienteVendidoNombre?: string;
  fechaVenta?: string | null;
  notas?: string;
}