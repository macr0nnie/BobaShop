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
  addEmployee(employee: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, employee);
  }
  //update an employee by id
  updateEmployee(id: number, employee: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }
  //delete an employee by id
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  //get an employee by name
  getEmployeeByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/name/${name}`);
  }

}

