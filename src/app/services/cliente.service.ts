import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/models/cliente.model';
 
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private api = 'http://localhost:8080/api/clientes';
 
  constructor(private http: HttpClient) {}
 
  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.api);
  }
 
  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.api}/${id}`);
  }
 
  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.api, cliente);
  }
 
  actualizar(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.api}/${id}`, cliente);
  }
 
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}