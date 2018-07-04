import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentStatsComponent } from './assessment-stats.component';

describe('AssessmentStatsComponent', () => {
  let component: AssessmentStatsComponent;
  let fixture: ComponentFixture<AssessmentStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
