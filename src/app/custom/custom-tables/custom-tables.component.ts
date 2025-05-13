import { Component, Input } from '@angular/core';
import { Employee_Data } from '../../custom/boba-data/boba-data.component';
import { CommonModule } from '@angular/common';  


@Component({
  selector: 'app-custom-tables',
  imports: [CommonModule],
  templateUrl: './custom-tables.component.html',
  styleUrl: './custom-tables.component.css'
})
export class CustomTablesComponent {
  
//@Input() employee:{name:string, position:string, salary:number, shift:string}[] = [];
//import the interface for the employee data
@Input() employee: Employee_Data[] = [];

}
