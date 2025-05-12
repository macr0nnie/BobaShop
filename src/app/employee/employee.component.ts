import { Component, OnInit } from '@angular/core';
import { EmployeeService} 
from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule, FormBuilder,FormGroup,} 
from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface Employee{
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}

export interface EmployeeFilter {
  id? : number;
  name? : string;
  position? : string;
  shift? : string;
  maxSalary? : number;
  minSalary? : number;   
  sortColumn? : string;
}

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading: boolean = true;
  setSelectedEmployee: Employee | null = null;

  searchTerm: string = '';
  searchSubject = new Subject<string>();
  filterForm: FormGroup;
  positions: string[] = [];
  shifts: string[] = [];
  salaryRanges: { value: number; label: string }[] = [];

  // API status
  apiError: string = '';
  filterApplied: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder
  ) {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.applySearch();
      });

    // Initialize filter form
    this.filterForm = this.fb.group({
      id: [''],
      name: [''],
      position: [''],
      salary: [''],
      shift: [''],
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
        //this.extractFilterOptions(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.apiError =
          'Failed to connect to employee database. Please try again later.';
        this.loading = false;
      },
    });
  }
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  applySearch(): void {
    if (!this.searchTerm) {
      this.applyFilters(); // If search is cleared, just show filtered results
      return;
    }
  }

  applyFilters(): void {
    this.loading = true;
    this.apiError = '';
    this.filterApplied = true;

    const filter: EmployeeFilter = {};

    const formValues = this.filterForm.value;
    if (formValues.id) filter.id = parseInt(formValues.id);
    if (formValues.name) filter.name = formValues.name;
    if (formValues.position) filter.position = formValues.position;
   // if (formValues.salary) filter.salary = parseInt(formValues.salary);
    if (formValues.shift) filter.shift = formValues.shift;

    // Check if any filter is applied
    const hasFilters = Object.keys(filter).length > 0; //how to get it too work
  }

}
