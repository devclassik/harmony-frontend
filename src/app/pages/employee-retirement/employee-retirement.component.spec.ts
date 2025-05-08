import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRetirementComponent } from './employee-retirement.component';

describe('EmployeeRetirementComponent', () => {
  let component: EmployeeRetirementComponent;
  let fixture: ComponentFixture<EmployeeRetirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeRetirementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRetirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
