import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecompositionDisplayComponent } from './decomposition-display.component';

describe('DecompositionDisplayComponent', () => {
  let component: DecompositionDisplayComponent;
  let fixture: ComponentFixture<DecompositionDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecompositionDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecompositionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
