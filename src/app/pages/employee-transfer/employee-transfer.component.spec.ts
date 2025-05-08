import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTransferComponent } from './employee-transfer.component';

describe('EmployeeTransferComponent', () => {
  let component: EmployeeTransferComponent;
  let fixture: ComponentFixture<EmployeeTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
