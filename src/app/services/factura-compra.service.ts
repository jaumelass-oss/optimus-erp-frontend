import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacturaCompraRequest, FacturaCompraResponse } from '../models/factura-compra.model';
import { EstadoFactura } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaCompraService {

  private readonly BASE = 'http://localhost:8080/api/facturas-compra';

  constructor(private http: HttpClient) {}

  listar(): Observable<FacturaCompraResponse[]> {
    return this.http.get<FacturaCompraResponse[]>(this.BASE);
  }

  listarPorEstado(estado: EstadoFactura): Observable<FacturaCompraResponse[]> {
    return this.http.get<FacturaCompraResponse[]>(`${this.BASE}?estado=${estado}`);
  }

  buscarPorId(id: number): Observable<FacturaCompraResponse> {
    return this.http.get<FacturaCompraResponse>(`${this.BASE}/${id}`);
  }

  crear(dto: FacturaCompraRequest): Observable<FacturaCompraResponse> {
    return this.http.post<FacturaCompraResponse>(this.BASE, dto);
  }

  cambiarEstado(id: number, estado: EstadoFactura): Observable<FacturaCompraResponse> {
    return this.http.patch<FacturaCompraResponse>(`${this.BASE}/${id}/estado`, JSON.stringify(estado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}