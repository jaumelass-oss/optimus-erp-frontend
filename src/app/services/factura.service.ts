import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoFactura, FacturaRequest, FacturaResponse } from 'src/app/models/factura.model';
 
@Injectable({ providedIn: 'root' })
export class FacturaService {
  private api = 'http://localhost:8080/api/facturas';
 
  constructor(private http: HttpClient) {}
 
  listar(): Observable<FacturaResponse[]> {
    return this.http.get<FacturaResponse[]>(this.api);
  }
 
  listarPorEstado(estado: EstadoFactura): Observable<FacturaResponse[]> {
    return this.http.get<FacturaResponse[]>(`${this.api}?estado=${estado}`);
  }
 
  buscarPorId(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.api}/${id}`);
  }
 
  crear(factura: FacturaRequest): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(this.api, factura);
  }
 
  actualizar(id: number, factura: FacturaRequest): Observable<FacturaResponse> {
    return this.http.put<FacturaResponse>(`${this.api}/${id}`, factura);
  }
 
  cambiarEstado(id: number, estado: EstadoFactura): Observable<FacturaResponse> {
    return this.http.patch<FacturaResponse>(`${this.api}/${id}/estado`, `"${estado}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
 
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}