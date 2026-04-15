import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activo } from './activo.model';

@Injectable({ providedIn: 'root' })
export class ActivoService {
    private url = 'http://localhost:8080/api/activos';

    constructor(private http: HttpClient) { }

    getActivos(): Observable<Activo[]> {
        return this.http.get<Activo[]>(this.url);
    }

    crearActivo(activo: Activo): Observable<Activo> {
        return this.http.post<Activo>(this.url, activo);
    }
}