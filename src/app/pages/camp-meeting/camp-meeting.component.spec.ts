import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampMeetingComponent } from './camp-meeting.component';

describe('CampMeetingComponent', () => {
  let component: CampMeetingComponent;
  let fixture: ComponentFixture<CampMeetingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampMeetingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CampMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
