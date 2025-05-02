import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { EmployeeFilter, Employee } from '../../services/employee.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent implements OnInit {
  // Data properties
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading: boolean = false;


  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {
    
  }

  ngOnInit() {
    this.fetchEmployees();
  }

  ngOnDestroy() {
    // Clean up subscriptions
  
  }

  // Fetch all employees from API
  fetchEmployees() {
  
  }
  
  // Extract available filter options from data
  populateFilterOptions(employees: Employee[]) {
    //get the values of the filters
    //get the value of the 
  }
  

  onConditionChange() {
  }


  // Use server-side filtering
  filter_data() {
    
  }
  // Reset all filters
  clearFilters() {
  
  }
  

}