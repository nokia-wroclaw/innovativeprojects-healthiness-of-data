import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonwealthComponent } from './commonwealth.component';

describe('CommonwealthComponent', () => {
  let component: CommonwealthComponent;
  let fixture: ComponentFixture<CommonwealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonwealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonwealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
