import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Map2DDisplayComponent } from './map2d-display.component';

describe('Map2DDisplayComponent', () => {
  let component: Map2DDisplayComponent;
  let fixture: ComponentFixture<Map2DDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Map2DDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Map2DDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
