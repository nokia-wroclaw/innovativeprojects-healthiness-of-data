import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Map2dDisplayComponent } from './map2d-display.component';

describe('Map2dDisplayComponent', () => {
  let component: Map2dDisplayComponent;
  let fixture: ComponentFixture<Map2dDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Map2dDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Map2dDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
