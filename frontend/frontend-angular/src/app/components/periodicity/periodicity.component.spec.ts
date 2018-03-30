import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicityComponent } from './periodicity.component';

describe('PeriodicityComponent', () => {
  let component: PeriodicityComponent;
  let fixture: ComponentFixture<PeriodicityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodicityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
