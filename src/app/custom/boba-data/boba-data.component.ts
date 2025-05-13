import { Component } from '@angular/core';

interface Employee_Data{
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}
interface Drink_Data{
  id: number;
  name: string;
  imag: string;
  price: number;
}


@Component({
  selector: 'app-boba-data',
  imports: [],
  templateUrl: './boba-data.component.html',
  styleUrl: './boba-data.component.css'
})
export class BobaDataComponent {

}
