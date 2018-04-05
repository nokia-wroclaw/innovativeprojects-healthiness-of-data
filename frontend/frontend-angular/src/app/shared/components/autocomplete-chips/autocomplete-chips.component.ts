import {Component, OnInit} from '@angular/core';
import {MatAutocompleteSelectedEvent, MatFormFieldControl} from '@angular/material';
import {FormControl, NgControl} from '@angular/forms';
import {Subject} from 'rxjs/Subject';


@Component({
  selector: 'app-autocomplete-chips',
  templateUrl: './autocomplete-chips.component.html',
  styleUrls: ['./autocomplete-chips.component.css'],
  providers: [{provide: MatFormFieldControl, useExisting: AutocompleteChipsComponent}]
})

export class AutocompleteChipsComponent implements OnInit, MatFormFieldControl<AutocompleteChipsComponent> {
  value: AutocompleteChipsComponent | null;
  id: string;
  placeholder: string;
  ngControl: NgControl | null;
  focused: boolean;
  empty: boolean;
  required: boolean;
  disabled: boolean;
  errorState: boolean;


  selectedChips: any = [];
  allChips = ['childott', 'drasheshu', 'khuxel', 'bliulfux', 'strathatuk'];
  optionsChips: any = [];
  formControl: FormControl = new FormControl();

  stateChanges = new Subject<void>();

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  constructor() {

  }

  setDescribedByIds(ids: string[]): void {
  }

  onContainerClick(event: MouseEvent): void {
  }

  ngOnInit() {
    this.optionsChips = this.allChips;
    this.formControl.valueChanges.subscribe(val => {
      this.filterOptions(val);
    });
  }

  addChip(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedChips.push(selection);
    this.allChips = this.allChips.filter(obj => obj !== selection);
    this.optionsChips = this.allChips;
    if (input) {
      input.value = '';
    }
  }

  removeChip(chip: any): void {
    const index = this.selectedChips.indexOf(chip);
    if (index >= 0) {
      this.selectedChips.splice(index, 1);
      this.allChips.push(chip);
    }
  }

  filterOptions(opt: string) {
    this.optionsChips = this.allChips
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0);
  }

}

