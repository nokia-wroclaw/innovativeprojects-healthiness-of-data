import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageComponent } from './coverage.component';

describe('CoverageComponent', () => {
  let component: CoverageComponent;
  let fixture: ComponentFixture<CoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
