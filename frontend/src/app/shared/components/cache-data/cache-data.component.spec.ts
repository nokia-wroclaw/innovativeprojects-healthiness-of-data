import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CacheDataComponent } from './cache-data.component';

describe('CacheDataComponent', () => {
  let component: CacheDataComponent;
  let fixture: ComponentFixture<CacheDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CacheDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CacheDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
