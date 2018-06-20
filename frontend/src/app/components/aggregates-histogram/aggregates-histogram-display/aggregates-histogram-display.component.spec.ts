import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatesHistogramDisplayComponent } from './aggregates-histogram-display.component';

describe('AggregatesHistogramDisplayComponent', () => {
  let component: AggregatesHistogramDisplayComponent;
  let fixture: ComponentFixture<AggregatesHistogramDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatesHistogramDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatesHistogramDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
