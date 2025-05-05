import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRecordsComponent } from './employee-records.component';

describe('EmployeeRecordsComponent', () => {
  let component: EmployeeRecordsComponent;
  let fixture: ComponentFixture<EmployeeRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
