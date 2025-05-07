import { Component, OnInit } from '@angular/core';
import { EmployeeService, Employee, EmployeeFilter } from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading: boolean = true;
  setSelectedEmployee: Employee | null = null;
  
  // Search functionality
  searchTerm: string = '';
  searchSubject = new Subject<string>();
  
  // Sorting
  currentSortColumn: keyof Employee | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filter form
  filterForm: FormGroup;
  
  // Filter options derived from data
  positions: string[] = [];
  shifts: string[] = [];
  salaryRanges: {value: number, label: string}[] = [];
  
  // API status
  apiError: string = '';
  filterApplied: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applySearch();
    });
    
    // Initialize filter form
    this.filterForm = this.fb.group({
      id: [''],
      name: [''],
      position: [''],
      salary: [''],
      shift: ['']
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.apiError = '';
    
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = [...data];
        this.extractFilterOptions(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.apiError = 'Failed to connect to employee database. Please try again later.';
        this.loading = false;
        
        // Fallback to sample data for testing
        this.useSampleData();
      }
    });
  }
  
  // Extract unique values from employee data for dropdown options
  extractFilterOptions(employees: Employee[]): void {
    // Extract unique positions
    const uniquePositions = new Set<string>();
    employees.forEach(emp => {
      if (emp.position) uniquePositions.add(emp.position);
    });
    this.positions = Array.from(uniquePositions).sort();
    
    // Extract unique shifts
    const uniqueShifts = new Set<string>();
    employees.forEach(emp => {
      if (emp.shift) uniqueShifts.add(emp.shift);
    });
    this.shifts = Array.from(uniqueShifts).sort();
    
    // Create meaningful salary ranges based on data
    this.salaryRanges = [];
    
    if (employees.length > 0) {
      // Find min and max salaries
      const salaries = employees.map(emp => emp.salary).filter(salary => salary !== undefined);
      if (salaries.length > 0) {
        const minSalary = Math.min(...salaries);
        const maxSalary = Math.max(...salaries);
        
        // Create ranges that make sense for the data
        // Start at the floor of the min salary (rounded to nearest 5k)
        const floorSalary = Math.floor(minSalary / 5000) * 5000;
        
        // Create reasonable ranges based on the actual data
        for (let i = floorSalary; i <= maxSalary; i += 5000) {
          this.salaryRanges.push({
            value: i,
            label: `Above ${this.formatSalary(i)}`
          });
        }
      }
    }
  }
  
  // Use sample data if the API is not available
  useSampleData(): void {
    const sampleData: Employee[] = [
      { id: 1, name: 'Jane Smith', position: 'Barista', salary: 35000, shift: 'Morning' },
      { id: 2, name: 'John Doe', position: 'Manager', salary: 52000, shift: 'Afternoon' },
      { id: 3, name: 'Alice Johnson', position: 'Barista', salary: 33000, shift: 'Evening' },
      { id: 4, name: 'Bob Brown', position: 'Cashier', salary: 31500, shift: 'Morning' },
      { id: 5, name: 'Carol White', position: 'Assistant Manager', salary: 44000, shift: 'Night' }
    ];
    
    this.employees = sampleData;
    this.filteredEmployees = [...sampleData];
    this.extractFilterOptions(sampleData);
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }
  
  applySearch(): void {
    if (!this.searchTerm) {
      this.applyFilters(); // If search is cleared, just show filtered results
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.filteredEmployees.filter(emp => 
      (emp.name?.toLowerCase().includes(term) || false) ||
      emp.position.toLowerCase().includes(term) ||
      emp.shift.toLowerCase().includes(term) ||
      emp.id.toString().includes(term) ||
      emp.salary.toString().includes(term)
    );
    
    if (this.currentSortColumn) {
      this.sortEmployees(this.currentSortColumn);
    }
  }

  applyFilters(): void {
    this.loading = true;
    this.apiError = '';
    this.filterApplied = true;
    
    // Build filter object from form values
    const filter: EmployeeFilter = {};
    
    // Only add properties that have values (not empty strings)
    const formValues = this.filterForm.value;
    if (formValues.id) filter.id = parseInt(formValues.id);
    if (formValues.name) filter.name = formValues.name;
    if (formValues.position) filter.position = formValues.position;
    if (formValues.salary) filter.salary = parseInt(formValues.salary);
    if (formValues.shift) filter.shift = formValues.shift;

    // Check if any filter is applied
    const hasFilters = Object.keys(filter).length > 0;
    
    if (hasFilters) {
      // Apply filters using API
      this.employeeService.getFilteredEmployees(filter).subscribe({
        next: (data) => {
          this.filteredEmployees = data;
          if (this.searchTerm) {
            this.applySearch();
          }
          if (this.currentSortColumn) {
            this.sortEmployees(this.currentSortColumn);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error filtering employees:', error);
          this.apiError = 'Error applying filters. Please try again.';
          this.loading = false;
          
          // Fallback to local filtering for testing
          this.applyLocalFilters(filter);
        }
      });
    } else {
      // If no filters are applied, load all employees
      this.loadEmployees();
    }
  }
  
  // Apply filters locally when API is not available
  applyLocalFilters(filter: EmployeeFilter): void {
    this.filteredEmployees = this.employees.filter(emp => {
      let match = true;
      
      if (filter.id !== undefined && emp.id !== filter.id) match = false;
      if (filter.name && !emp.name?.toLowerCase().includes(filter.name.toLowerCase())) match = false;
      if (filter.position && emp.position !== filter.position) match = false;
      if (filter.salary !== undefined && emp.salary < filter.salary) match = false;
      if (filter.shift && emp.shift !== filter.shift) match = false;
      
      return match;
    });
    
    if (this.searchTerm) {
      this.applySearch();
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.searchTerm = '';
    this.filterApplied = false;
    this.loadEmployees();
  }

  sortEmployees(column: keyof Employee): void {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredEmployees.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return this.sortDirection === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      }
    });
  }

  getSortIcon(column: keyof Employee): string {
    if (this.currentSortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
  
  // Helper function to format salary
  formatSalary(salary: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(salary);
  }
}