import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormBuilder,FormGroup } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}


@Component({
  selector: 'app-update-employee',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './update-employee.component.html',
  styleUrl: './update-employee.component.css'
})
export class UpdateEmployeeComponent{
  employee: Employee[] =[];
  Loading: boolean = true;
  setSelectedEmployee: Employee | null = null; // For storing selected employee details

 

}
