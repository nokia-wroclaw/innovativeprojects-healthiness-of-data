import {Component, Injectable, OnInit, Input, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material';


@Component({
  selector: 'app-autocomplete-chips',
  templateUrl: './autocomplete-chips.component.html',
  styleUrls: ['./autocomplete-chips.component.css']
})

export class AutocompleteChipsComponent implements OnInit {

  @Input() chipsFull: any = [];
  @Input() controlName: string;
  @Output() chipsSelected: any = [];
  chipsFiltered: any = [];
@Input()  formControl;
  coverageParams: FormGroup;

  constructor() {
  }

  ngOnInit() {
    console.log('control name');
    console.log(this.controlName);
    // Set initial value of filteredOptions to all Options
    this.chipsFiltered = this.chipsFull;
    // Subscribe to listen for changes to AutoComplete input and run filter
    this.formControl.valueChanges.subscribe(val => {
      this.filterOptions(val);
    });
  }

  addChip(event: MatAutocompleteSelectedEvent, input: any): void {
    // Define selection constant
    const selection = event.option.value;
    // Add chip for selected option
    this.chipsSelected.push(selection);
    // Remove selected option from available options and set filteredOptions
    this.chipsFull = this.chipsFull.filter(obj => obj.name !== selection.name);
    this.chipsFiltered = this.chipsFull;
    // Reset the autocomplete input text value
    if (input) {
      input.value = '';
    }
    console.log('chips');
    console.log(this.chipsSelected);
  }

  removeChip(chip: any): void {
    // Find key of object in array
    const index = this.chipsSelected.indexOf(chip);
    // If key exists
    if (index >= 0) {
      // Remove key from chips array
      this.chipsSelected.splice(index, 1);
      // Add key to options array
      this.chipsFull.push(chip);
    }
  }

  filterOptions(ttt: string) {
    // Set filteredOptions array to filtered options
    this.chipsFiltered = this.chipsFull
      .filter(obj => obj.name.toLowerCase().indexOf(ttt.toString().toLowerCase()) === 0);
  }



}
