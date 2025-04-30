import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormBuilder,FormGroup } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';



@Component({
  selector: 'app-update-employee',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './update-employee.component.html',
  styleUrl: './update-employee.component.css'
})
export class UpdateEmployeeComponent {




}
