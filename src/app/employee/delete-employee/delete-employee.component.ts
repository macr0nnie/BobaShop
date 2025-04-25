import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}

@Component({
  selector: 'app-delete-employee',
  standalone: true,
  templateUrl: './delete-employee.component.html',
  styleUrls: ['./delete-employee.component.css'],
  imports: [CommonModule],
})
export class DeleteEmployeeComponent implements OnInit {
  employees: Employee[] = []; // List of employees
  loading: boolean = true; // Loading state

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.fetchEmployees(); // Fetch employees on component initialization
  }

  // Fetch the list of employees
  fetchEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        console.log('Fetched employees:', data); // Debugging
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.loading = false;
      },
    });
  }

  // Delete an employee by ID
  deleteEmployee(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this employee?');
    if (confirmDelete) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter((employee) => employee.id !== id); // Remove the deleted employee from the list
          console.log(`Employee with ID ${id} deleted successfully.`);
        },
        error: (err) => {
          console.error('Error deleting employee:', err);
        },
      });
    }
  }
}