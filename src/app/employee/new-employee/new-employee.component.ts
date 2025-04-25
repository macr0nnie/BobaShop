import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface Employee {
  id: number;
  name: string;
  position: string;
  salary: number;
  shift: string;
}

@Component({
  selector: 'app-new-employee',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './new-employee.component.html',
  styleUrls: ['./new-employee.component.css'],
})
export class NewEmployeeComponent implements OnInit {
  employeeForm: FormGroup;

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {
    // Initialize the form group
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required]],
      salary: [0, [Validators.required, Validators.min(1)]],
      position: ['', [Validators.required]],
      shift: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  // Submit function
  AddNewEmployeeSubmit(): void {
    if (this.employeeForm.valid) {
      const newEmployee: Employee = this.employeeForm.value;

      this.employeeService.addEmployee(newEmployee).subscribe({
        next: (data) => {
          console.log('Employee added successfully:', data);
          this.employeeForm.reset(); // Reset the form after submission
        },
        error: (err) => {
          console.error('Error adding employee:', err);
        },
      });
    } else {
      console.log('Form is invalid');
    }
  }
}