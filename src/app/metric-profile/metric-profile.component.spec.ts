import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricProfileComponent } from './metric-profile.component';

describe('MetricProfileComponent', () => {
  let component: MetricProfileComponent;
  let fixture: ComponentFixture<MetricProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
