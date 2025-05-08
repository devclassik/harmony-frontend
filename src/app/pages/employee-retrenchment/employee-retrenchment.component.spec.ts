import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRetrenchmentComponent } from './employee-retrenchment.component';

describe('EmployeeRetrenchmentComponent', () => {
  let component: EmployeeRetrenchmentComponent;
  let fixture: ComponentFixture<EmployeeRetrenchmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeRetrenchmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRetrenchmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
