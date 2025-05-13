import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BobaDataComponent } from './boba-data.component';

describe('BobaDataComponent', () => {
  let component: BobaDataComponent;
  let fixture: ComponentFixture<BobaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BobaDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BobaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
