import { Component, OnInit } from '@angular/core';
import { DrinksService } from '../services/drinks.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsConfiguration } from 'ng2-charts';
import { CommonModule } from '@angular/common';


interface Drink {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-drinks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drinks.component.html',
  styleUrls: ['./drinks.component.css']
})
export class DrinksComponent implements OnInit {
  drinks: Drink[] = [];
  loading: boolean = true;

  // Chart configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartLabels: string[] = [];
  public barChartData: { data: number[]; label: string }[] = [
    { data: [], label: 'Drink Prices' }
  ];
  public barChartType: ChartType = 'bar';

  constructor(private drinksService: DrinksService) {}

  ngOnInit(): void {
    this.drinksService.getDrinks().subscribe({
      next: (data) => {
        this.drinks = data;
        this.loading = false;

        // Populate chart data
        this.barChartLabels = this.drinks.map((drink) => drink.name);
        this.barChartData[0].data = this.drinks.map((drink) => drink.price);
      },
      error: (err) => {
        console.error('Error fetching drinks:', err);
        this.loading = false;
      }
    });
  }
}