import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinksService } from '../services/drinks.service';

interface Drink {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
}

@Component({
  selector: 'app-drinks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drinks.component.html',
  styleUrls: ['./drinks.component.css']
})
export class DrinksComponent implements OnInit {
  drinks: Drink[] = [];
  loading = false;
  drinkForm: FormGroup;
  currency: string = '$';

  constructor(
    private fb: FormBuilder,
    private drinksService: DrinksService,
  ) {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      imageUrl: ['']
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


}


