import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGreetingsComponent } from './dashboard-greetings.component';

describe('DashboardGreetingsComponent', () => {
  let component: DashboardGreetingsComponent;
  let fixture: ComponentFixture<DashboardGreetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGreetingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGreetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
