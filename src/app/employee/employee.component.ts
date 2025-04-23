import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}

@Component({
  selector: 'app-employee',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  loading: boolean = true;
  setSelectedEmployee: Employee | null = null; // For storing selected employee details

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.loading = false;
      },
    });
  }
  getEmployeeById(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        console.log('Employee details:', data);
        this.setSelectedEmployee = data; // Store the selected employee details
      },
      error: (err) => {
        console.error('Error fetching employee:', err);
      },
    });
  }
  addEmployee(employee: Employee): void {
    this.employeeService.addEmployee(employee).subscribe({
      next: (data) => {
        console.log('Employee added:', data);
        this.employees.push(data); // Add the new employee to the list
      },
      error: (err) => {
        console.error('Error adding employee:', err);
      },
    });
  }
}
