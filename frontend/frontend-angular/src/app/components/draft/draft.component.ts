import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material';

export class State {
  constructor(public name: string) {
  }
}

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  // Set up reactive formcontrol
  autoCompleteChipList: FormControl = new FormControl();
  coverageParams: FormGroup;
  formControl: FormControl = new FormControl();


  kpiBaseNames = [
    {name: 'FLNS_519'},
    {name: 'AVA_68'},
    {name: 'TRF_215'},
  ];
  options = [
    {name: 'FLNS_519'},
    {name: 'AVA_68'},
    {name: 'TRF_215'},
    {name: 'FLNS_519'},
    {name: 'AVA_68'},
    {name: 'TRF_215'},
    {name: 'FLNS_519'},
    {name: 'AVA_68'},
    {name: 'TRF_215'},
    {name: 'FLNS_519'},
    {name: 'AVA_68'},
    {name: 'TRF_215'},
  ];


  filteredOptions = [];
  chips = [];

  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.initForm();

    // Set initial value of filteredOptions to all Options
    this.filteredOptions = this.options;
    // Subscribe to listen for changes to AutoComplete input and run filter
    this.autoCompleteChipList.valueChanges.subscribe(val => {
      this.filterOptions(val);
    });
  }


  addChip(event: MatAutocompleteSelectedEvent, input: any): void {
    // Define selection constant
    const selection = event.option.value;
    // Add chip for selected option
    this.chips.push(selection);
    // Remove selected option from available options and set filteredOptions
    this.options = this.options.filter(obj => obj.name !== selection.name);
    this.filteredOptions = this.options;
    // Reset the autocomplete input text value
    if (input) {
      input.value = '';
    }
    console.log('chips');
    console.log(this.chips);
  }

  removeChip(chip: any): void {
    // Find key of object in array
    const index = this.chips.indexOf(chip);
    // If key exists
    if (index >= 0) {
      // Remove key from chips array
      this.chips.splice(index, 1);
      // Add key to options array
      this.options.push(chip);
    }
  }

  filterOptions(ttt: string) {
    // Set filteredOptions array to filtered options
    this.filteredOptions = this.options
      .filter(obj => obj.name.toLowerCase().indexOf(ttt.toString().toLowerCase()) === 0);
  }

  initForm() {
    this.coverageParams = this.formBuilder.group({
      kpiBaseNames: ''
    });
  }
}
