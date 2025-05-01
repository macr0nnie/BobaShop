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
  
  // Filter related properties
  @Output() filterChanged = new EventEmitter<EmployeeFilter>();
  filter: EmployeeFilter = {};
  salaryRange = {
    min: 0,
    max: 0
  };
  
  // Dropdown options
  availableShifts: string[] = [];
  useFrontendFiltering: boolean = true;

  // For analytics
  recordCount: number = 0;
  
  // RxJS for debounced filtering
  private filterSubject = new Subject<void>();
  private currentFilterSubscription?: Subscription;

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {
    // Set up debounced filtering
    this.filterSubject
      .pipe(
        debounceTime(300), // Wait 300ms after last event
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyFiltersInternal();
      });
  }

  ngOnInit() {
    // Initialize filter with defaults
    this.filter = {
      salary: 0 // Will be updated when we know the actual min
    };
    this.fetchEmployees();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.currentFilterSubscription) {
      this.currentFilterSubscription.unsubscribe();
    }
  }

  // Fetch all employees from API
  fetchEmployees() {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = [...employees];
        this.recordCount = employees.length;
        
        // Extract unique shifts for dropdown
        this.populateFilterOptions(employees);
        
        this.loading = false;
        // Force Angular to detect changes
        this.cdr.detectChanges();
        console.log('Employees loaded:', employees.length);
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.loading = false;
        // Show user error message
        alert('Failed to load employees. Please try again later.');
      },
    });
  }
  
  // Extract available filter options from data
  populateFilterOptions(employees: Employee[]) {
    // Get unique shifts
    const shifts = new Set<string>();
    // Get salary range
    let minSalary = Number.MAX_VALUE;
    let maxSalary = 0;
    
    employees.forEach(emp => {
      // Add shift to set (sets only store unique values)
      if (emp.shift) {
        shifts.add(emp.shift);
      }
      
      // Update salary range
      if (emp.salary < minSalary) minSalary = emp.salary;
      if (emp.salary > maxSalary) maxSalary = emp.salary;
    });
    
    // Convert set to array
    this.availableShifts = Array.from(shifts).sort();
    
    // Set salary range (round to nearest whole number)
    this.salaryRange.min = Math.floor(minSalary);
    this.salaryRange.max = Math.ceil(maxSalary);
    
    // Initialize filter with defaults
    if (!this.filter.salary) {
      this.filter.salary = this.salaryRange.min;
      // Force change detection for this initialization
      this.cdr.detectChanges();
    }
  }
  
  // Called when filter inputs change
  applyFiltersAuto() {
    // Cancel any previous filter operation
    if (this.loading) {
      console.log('Cancelling previous filter operation');
    }
    
    // Trigger debounced filtering
    this.filterSubject.next();
    
    // Ensure UI reflects current state
    this.cdr.detectChanges();
  }
  
  // Internal method to handle filters
  applyFiltersInternal() {
    if (this.useFrontendFiltering) {
      this.filterLocally();
    } else {
      this.filterOnServer();
    }
  }
  
  // Use server-side filtering
  filterOnServer() {
    this.loading = true;
    
    // Cancel any ongoing subscription
    if (this.currentFilterSubscription) {
      this.currentFilterSubscription.unsubscribe();
    }
    
    // Log what we're sending to the server
    console.log('Sending filter to server:', this.filter);
    
    this.currentFilterSubscription = this.employeeService.getFilteredEmployees(this.filter).subscribe({
      next: (filteredResults) => {
        // Create a completely new array for change detection
        this.filteredEmployees = [...filteredResults];
        this.recordCount = filteredResults.length;
        this.loading = false;
        
        // Force Angular to detect changes
        this.cdr.detectChanges();
        console.log('Server returned:', filteredResults.length, 'results');
      },
      error: (error) => {
        console.error('Server filtering failed:', error);
        this.loading = false;
        
        // Alert user and fallback to local filtering
        alert('Server filtering failed. Switching to local filtering.');
        this.useFrontendFiltering = true;
        this.filterLocally();
      }
    });
  }

  // Apply filters locally
  filterLocally() {
    // Create a new filtered array (important for change detection)
    const filtered = this.employees.filter((emp) => {
      // Filter by name if specified
      if (
        this.filter.name &&
        !emp.name?.toLowerCase().includes(this.filter.name.toLowerCase())
      ) {
        return false;
      }

      // Filter by position if specified
      if (
        this.filter.position &&
        !emp.position.toLowerCase().includes(this.filter.position.toLowerCase())
      ) {
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
    
    // Update with new array reference (triggers change detection)
    this.filteredEmployees = [...filtered];
    this.recordCount = this.filteredEmployees.length;
    this.loading = false;
    
    // Log results for debugging
    console.log(`Filtered: ${this.filteredEmployees.length} of ${this.employees.length} employees`);
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Emit filter change event
    this.filterChanged.emit({ ...this.filter });
  }

  // Reset all filters
  clearFilters() {
    // Reset with default salary value
    this.filter = {
      salary: this.salaryRange.min
    };
    
    // Reset filtered employees
    this.filteredEmployees = [...this.employees];
    this.recordCount = this.employees.length;
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Apply the default filters
    this.applyFiltersInternal();
    
    // Notify parent components
    this.filterChanged.emit({ ...this.filter });
  }
  
  // Toggle between frontend/backend filtering
  toggleFilteringMethod() {
    this.useFrontendFiltering = !this.useFrontendFiltering;
    this.applyFiltersInternal();
  }
}