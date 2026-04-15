export interface Activo {
  id?: number;
  nombre: string;
  numero_serie: string;
  tipo: string;
  valor: number;
  stock: number;
  empleado_Id?: number; 
}