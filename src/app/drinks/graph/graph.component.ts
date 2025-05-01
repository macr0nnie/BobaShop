import { Component } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-graph',
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  constructor(private employeeService: EmployeeService) {
    this.fetchEmployees(); 
  }
  fetchEmployees() {
    this.employeeService.getAllEmployees().subscribe(employees => {
      console.log(employees);
    });
  }
}
