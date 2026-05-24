export interface Departamento {
  id?: number;
  nombre: string;
  totalEmpleados?: number;
  empleados?: EmpleadoResumen[];
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

export interface EmpleadoResumen {
  id: number;
  nombreCompleto: string;
  emailCorporativo?: string;
  tarifaHora?: number;
}