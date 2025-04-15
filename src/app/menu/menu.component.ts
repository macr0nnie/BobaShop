import { Component, HostListener  } from '@angular/core';
import { RouterLink,RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
}

