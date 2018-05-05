import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutliersDisplayComponent } from './outliers-display.component';

describe('OutliersDisplayComponent', () => {
  let component: OutliersDisplayComponent;
  let fixture: ComponentFixture<OutliersDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutliersDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutliersDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
