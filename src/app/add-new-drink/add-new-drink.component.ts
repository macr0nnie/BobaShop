import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DrinksService } from '../services/drinks.service';
import { Router } from '@angular/router';

interface Drink {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
}

@Component({
  selector: 'app-add-new-drink',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-new-drink.component.html',
  styleUrl: './add-new-drink.component.css',
})
export class AddNewDrinkComponent implements OnInit {
  drinkForm: FormGroup;
  loading: boolean = false;
  currency: string = '$';
  drinks: Drink[] = [];
  //variable for storing the recently added drink
  recentlyAdded: Drink | null = null;

  deleteMessage: string = '';
  showDeleteMessage: boolean = false;
  updateMessage: string = '';
  showUpdateMessage: boolean = false;

  constructor(
    private fb: FormBuilder,
    private drinksService: DrinksService,
    private router: Router
  ) {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      imageUrl: [''],
    });
  }
  ngOnInit(): void {
    this.loadDrinks();
  }

  // Load all drinks from the service
  loadDrinks(): void {
    this.drinksService.getDrinks().subscribe({
      next: (data) => {
        this.drinks = data;
      },
      error: (error) => {
        console.error('Error fetching drinks:', error);
      },
    });
  }
  //call a reloadPage function to refresh the page
  reloadPage() {
    this.router.navigate([this.router]);
  }

  // Add a new drink
  addDrink(): void {
    if (this.drinkForm.invalid) {
      this.markFormGroupTouched(this.drinkForm);
      return;
    }

    this.loading = true;
    const formValue = this.drinkForm.value;

    const newDrink: Drink = {
      id: 0,
      name: formValue.name,
      price: formValue.price,
      imageUrl: formValue.imageUrl,
    };

    this.drinksService.addDrink(newDrink).subscribe({
      next: (addedDrink) => {
        this.loading = false;
        this.recentlyAdded = addedDrink;
        this.drinkForm.reset();
        this.loadDrinks(); // Refresh the list from the service
       
      },
      error: (err) => {
        console.error('Error adding drink:', err);
        this.loading = false;
      },
    });
  }

  // Delete a drink
  deleteDrink(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete the drink "${name}"?`)) {
      this.drinksService.deleteDrink(id).subscribe({
        next: () => {
          this.loadDrinks(); // Refresh the list from the service
          this.deleteMessage = `Drink "${name}" was successfully deleted.`;
          this.showDeleteMessage = true;

          setTimeout(() => {
            this.showDeleteMessage = false;
          }, 3000);

          // If we just deleted the recently added drink
          if (this.recentlyAdded && this.recentlyAdded.id === id) {
            this.recentlyAdded = null;
          }
        },
        error: (error) => {
          console.error(`Error deleting drink ${id}:`, error);
        },
      });
    }
  }

  // Mark all form controls as touched for validation
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.controls[key].markAsTouched();
    });
  }
}
