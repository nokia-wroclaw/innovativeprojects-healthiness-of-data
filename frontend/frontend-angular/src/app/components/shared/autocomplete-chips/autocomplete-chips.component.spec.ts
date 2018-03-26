import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteChipsComponent } from './autocomplete-chips.component';

describe('AutocompleteChipsComponent', () => {
  let component: AutocompleteChipsComponent;
  let fixture: ComponentFixture<AutocompleteChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutocompleteChipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
