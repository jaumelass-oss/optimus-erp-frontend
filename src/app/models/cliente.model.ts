export interface Cliente {
  id?: number;
  razonSocial: string;
  cifVies: string;
  pais?: string;
  emailFacturacion?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  telefono?: string;
  formaPago?: 'CONTADO' | '30_DIAS' | '60_DIAS';
  medioPago?: 'TRANSFERENCIA' | 'GIRO';
  diasVencimiento?: number;
}