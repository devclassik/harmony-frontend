import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveOfAbsenceComponent } from './leave-of-absence.component';

describe('LeaveOfAbsenceComponent', () => {
  let component: LeaveOfAbsenceComponent;
  let fixture: ComponentFixture<LeaveOfAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveOfAbsenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveOfAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
