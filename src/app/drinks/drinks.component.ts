import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrinksService } from '../services/drinks.service';

interface Drink {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-drinks',
  templateUrl: './drinks.component.html',
  styleUrls: ['./drinks.component.css']
})
export class DrinksComponent implements OnInit {
  drinks: Drink[] = [];
  loading = false;
  drinkForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private drinksService: DrinksService,
  ) {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]]
    });
  }
  ngOnInit(): void {
    this.loadDrinks();
  }
  loadDrinks(): void {
    this.loading = true;
    this.drinksService.getDrinks().subscribe({
      next: (drinks) => {
        this.drinks = drinks;
        this.loading = false;
      },
    });
  }
  addDrink(): void {
    if (this.drinkForm.invalid) {
      this.markFormGroupTouched(this.drinkForm);
      return;
    }

    this.loading = true;
    const formValue = this.drinkForm.value;

    // Create a clean drink object without circular references
    const newDrink: Drink = {
      id: 0, // Let backend assign ID
      name: formValue.name,
      price: formValue.price
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}