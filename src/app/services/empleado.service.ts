import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from '../models/rrhh.model';
 
@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private api = 'http://localhost:8080/api/empleados';
 
  constructor(private http: HttpClient) {}
 
  listar(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.api);
  }
 
  listarPorDepartamento(depId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.api}?departamentoId=${depId}`);
  }
 
  buscar(termino: string): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.api}?buscar=${termino}`);
  }
 
  crear(e: Empleado): Observable<Empleado> {
    return this.http.post<Empleado>(this.api, e);
  }
 
  actualizar(id: number, e: Empleado): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.api}/${id}`, e);
  }
 
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}