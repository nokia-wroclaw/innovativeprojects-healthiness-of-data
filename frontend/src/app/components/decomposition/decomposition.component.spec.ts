import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecompositionComponent } from './decomposition.component';

describe('DecompositionComponent', () => {
  let component: DecompositionComponent;
  let fixture: ComponentFixture<DecompositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecompositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
