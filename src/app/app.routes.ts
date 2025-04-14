import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { SplineViewerComponent } from './spline-viewer/spline-viewer.component';
import { ShopComponent } from './shop/shop.component';

export const routes: Routes = [
    { path: 'menu', component: MenuComponent },
    { path: 'spline-viewer', component: SplineViewerComponent},
    { path: 'shop' , component: ShopComponent}
];
