import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-shop',
  imports: [RouterModule],
  templateUrl: './shop.component.html',
  standalone: true,
  styleUrl: './shop.component.css'
})
export class ShopComponent {
  drink = "";
  click_counter =  0;
  handleClick() {
      this.click_counter++;
  }
  OrderDrink(){
    //get the drink from the input field
    this.drink = (<HTMLInputElement>document.getElementById("drink")).value;
  }
}
