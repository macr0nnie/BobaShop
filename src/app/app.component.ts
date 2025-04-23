import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'BobaShop';
}
