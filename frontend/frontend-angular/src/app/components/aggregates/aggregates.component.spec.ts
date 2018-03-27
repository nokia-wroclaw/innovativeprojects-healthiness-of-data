import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregatesComponent } from './aggregates.component';

describe('AggregatesComponent', () => {
  let component: AggregatesComponent;
  let fixture: ComponentFixture<AggregatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
