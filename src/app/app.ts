import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivoListComponent } from './activo-list/activo-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ActivoListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('optimus-erp');
}
