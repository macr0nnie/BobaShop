import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'



export interface Employee {
  id: number;
  name? : string;
  position: string;
  salary: number;
  shift: string;
}

export interface EmployeeFilter {
  id?: number;
  name?: string;
  position?: string;
  salary?: number;
  shift?: string;
}

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
 
  getFilteredEmployees(filter: EmployeeFilter): Observable<Employee[]> {
    // Build query parameters from filter object
    let params = new HttpParams();
    
    if (filter.id) params = params.append('id', filter.id.toString());
    if (filter.name) params = params.append('name', filter.name);
    if (filter.position) params = params.append('position', filter.position);
    if (filter.salary) params = params.append('salary', filter.salary.toString());
    if (filter.shift) params = params.append('shift', filter.shift);

    return this.http.get<Employee[]>(`${this.apiUrl}/filter`, { params });
  }

}

