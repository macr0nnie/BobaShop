import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { EmployeeFilter, Employee } from '../../services/employee.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading: boolean = false;
  
  @Output() filterChanged = new EventEmitter<EmployeeFilter>();
  filter: EmployeeFilter = {};
  
  private filterSubject = new Subject<void>();

  constructor(private employeeService: EmployeeService) {
    // Set up debounced filtering
    this.filterSubject.pipe(
      debounceTime(300), // Wait 300ms after last event
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterLocally();
    });
  }
  
  ngOnInit() {
    this.fetchEmployees();
  }

  fetchEmployees() {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = [...employees]; // Initialize with all employees
        this.loading = false;
        console.log('Employees loaded:', employees);
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.loading = false;
      }
    });
  }
  // Called when filter inputs change
  applyFiltersAuto() {
    this.filterSubject.next();
  }
  // Called by button or manually
  applyFilters() {
    this.loading = true;
    this.filterLocally();
    this.filterChanged.emit({...this.filter});
  }

  filterLocally() {
    this.filteredEmployees = this.employees.filter(emp => {
      // Filter by name if specified
      if (this.filter.name && !emp.name?.toLowerCase().includes(this.filter.name.toLowerCase())) {
        return false;
      }
      
      // Filter by position if specified
      if (this.filter.position && !emp.position.toLowerCase().includes(this.filter.position.toLowerCase())) {
        return false;
      }
      
      // Filter by shift if specified
      if (this.filter.shift && emp.shift !== this.filter.shift) {
        return false;
      }
      
      // Filter by minimum salary if specified
      if (this.filter.salary && emp.salary < this.filter.salary) {
        return false;
      }
      return true;
    });
    
    this.loading = false;
  }

  clearFilters() {
    this.filter = {};
    this.filteredEmployees = [...this.employees]; // Reset to all employees
    this.filterChanged.emit({...this.filter});
  }
}