import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTablesComponent } from './custom-tables.component';

describe('CustomTablesComponent', () => {
  let component: CustomTablesComponent;
  let fixture: ComponentFixture<CustomTablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
