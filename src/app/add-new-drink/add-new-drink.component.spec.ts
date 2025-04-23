import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDrinkComponent } from './add-new-drink.component';

describe('AddNewDrinkComponent', () => {
  let component: AddNewDrinkComponent;
  let fixture: ComponentFixture<AddNewDrinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewDrinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewDrinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
