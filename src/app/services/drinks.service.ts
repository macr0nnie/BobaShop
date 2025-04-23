import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrinksService {
  private apiUrl = 'http://localhost:5000/api/Drinks';
  constructor(private http: HttpClient) { }

  getDrinks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getDrinkById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  } 
  addDrink(drink: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, drink);
  }
  updateDrink(id: number, drink: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, drink);
  }
  deleteDrink(id: number): Observable<any> {  
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getDrinkByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/name/${name}`);
  } 
}
