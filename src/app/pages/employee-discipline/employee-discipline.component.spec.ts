import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDisciplineComponent } from './employee-discipline.component';

describe('EmployeeDisciplineComponent', () => {
  let component: EmployeeDisciplineComponent;
  let fixture: ComponentFixture<EmployeeDisciplineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDisciplineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDisciplineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
