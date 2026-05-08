import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Departamento } from '../models/rrhh.model';
 
@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private api = 'http://localhost:8080/api/departamentos';
 
  constructor(private http: HttpClient) {}
 
  listar(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(this.api);
  }
 
  crear(d: Departamento): Observable<Departamento> {
    return this.http.post<Departamento>(this.api, d);
  }
 
  actualizar(id: number, d: Departamento): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.api}/${id}`, d);
  }
 
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}