import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { CustomTablesComponent } from './custom/custom-tables/custom-tables.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'BobaShop';
}
