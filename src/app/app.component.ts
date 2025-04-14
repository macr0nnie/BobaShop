import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./menu/menu.component";
import { SplineViewerComponent } from "./spline-viewer/spline-viewer.component";



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, SplineViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'BobaShop';
}



