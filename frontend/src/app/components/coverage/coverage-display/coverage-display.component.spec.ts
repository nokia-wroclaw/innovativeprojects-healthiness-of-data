import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageDisplayComponent } from './coverage-display.component';

describe('CoverageDisplayComponent', () => {
  let component: CoverageDisplayComponent;
  let fixture: ComponentFixture<CoverageDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverageDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
