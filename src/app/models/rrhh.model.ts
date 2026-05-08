export type Sede = 'VALENCIA' | 'RUMANIA' | 'ALEMANIA';
 
export interface Departamento {
  id?: number;
  nombre: string;
  sede: Sede;
  totalEmpleados?: number;
}
 
export interface Empleado {
  id?: number;
  nombre: string;
  apellidos: string;
  nombreCompleto?: string;
  emailCorporativo?: string;
  departamentoId?: number | null;
  departamentoNombre?: string;
  tarifaHora?: number;
}