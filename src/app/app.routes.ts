import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { SplineViewerComponent } from './spline-viewer/spline-viewer.component';
import { ShopComponent } from './shop/shop.component';
import { DrinksComponent } from './drinks/drinks.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AboutComponent } from './about/about.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { EmployeeComponent } from './employee/employee.component';
import { DeleteEmployeeComponent } from './employee/delete-employee/delete-employee.component';
import { UpdateEmployeeComponent } from './employee/update-employee/update-employee.component';
import { NewEmployeeComponent } from './employee/new-employee/new-employee.component';

export const routes: Routes = [
  { path: 'menu', component: MenuComponent },
  { path: 'spline-viewer', component: SplineViewerComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'drinks', component: DrinksComponent },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: 'about', component: AboutComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'employee/new-employee', component: NewEmployeeComponent },
  { path: 'employee/update', component: UpdateEmployeeComponent },
  { path: 'employee/delete', component: DeleteEmployeeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
];
