import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePromotionComponent } from './employee-promotion.component';

describe('EmployeePromotionComponent', () => {
  let component: EmployeePromotionComponent;
  let fixture: ComponentFixture<EmployeePromotionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeePromotionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeePromotionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
