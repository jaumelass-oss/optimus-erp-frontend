export interface Activo {
  id?: number;
  nombre: string;
  numeroSerie: string;
  tipo: string;
  valor: number;
  stock: number;
  empleadoId?: number; 
}