import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:5000/api/employee'; // Replace with your API URL
  constructor(private http: HttpClient) { }
  //list the employees
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  //get an employee by id
  getEmployeeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  //connect to a form 

}

