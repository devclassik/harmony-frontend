import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingAndAnalyticsComponent } from './reporting-and-analytics.component';

describe('ReportingAndAnalyticsComponent', () => {
  let component: ReportingAndAnalyticsComponent;
  let fixture: ComponentFixture<ReportingAndAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingAndAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingAndAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
