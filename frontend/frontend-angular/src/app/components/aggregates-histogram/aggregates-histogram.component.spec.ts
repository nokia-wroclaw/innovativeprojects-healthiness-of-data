import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatesHistogramComponent } from './aggregates-histogram.component';

describe('AggregatesHistogramComponent', () => {
  let component: AggregatesHistogramComponent;
  let fixture: ComponentFixture<AggregatesHistogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatesHistogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatesHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
