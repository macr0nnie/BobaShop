import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatedPortfolioComponent } from './updated-portfolio.component';

describe('UpdatedPortfolioComponent', () => {
  let component: UpdatedPortfolioComponent;
  let fixture: ComponentFixture<UpdatedPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatedPortfolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatedPortfolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
