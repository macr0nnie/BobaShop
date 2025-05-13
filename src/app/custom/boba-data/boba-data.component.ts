import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventEmitter } from '@angular/core';

export interface Employee_Data{
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}
export interface Drink_Data{
  id: number;
  name: string;
  imag: string;
  price: number;
}

@Component({
  selector: 'app-boba-data',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './boba-data.component.html',
  styleUrl: './boba-data.component.css'
})
export class BobaDataComponent {
  //defining the models 
  @Input() Employee_Data: Employee_Data[] = []; 
  @Output() employeeSelected: EventEmitter<Employee_Data> = new EventEmitter<Employee_Data>();

  @Input() Drink_Data: Drink_Data[] = [];
  @Output() drinkSelected: EventEmitter<Drink_Data> = new EventEmitter<Drink_Data>();
  // Function to handle employee selection
  selectEmployee(employee: Employee_Data) {
    this.employeeSelected.emit(employee);
  }
  // Function to handle drink selection
  selectDrink(drink: Drink_Data) {
    this.drinkSelected.emit(drink);
  }

}
