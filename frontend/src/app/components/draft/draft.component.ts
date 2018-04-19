import {Component, OnInit} from '@angular/core';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';


@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit {
  separatorKeysCodes = [ENTER, COMMA, TAB];
  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  // filteredAcronyms: Observable<string[]>;

  selectedKpiBasenames: any = ['TRF_215', 'SGSN_2012'];
  selectedAcronyms: any = ['strathatuk', 'drasheshu'];
  // filteredKpiBasenames: any = ['TRF_215'];
  filteredAcronyms: any = [];


  draftParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymsFormControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);

  selectable = true;
  removable = true;
  addOnBlur = true;

  constructor(private formBuilder: FormBuilder,
              private cacheData: CacheDataComponent,
              private sharedFunctions: SharedFunctionsService) {

    this.fullKpiBasenamesList = this.cacheData.getKpiBasenamesList();
    this.fullCordIDsList = this.cacheData.getFullCordIDsList();
    this.fullCordIDsAcronymsSet = this.cacheData.getFullCordIDsAcronymsSet();

  }

  ngOnInit() {
    this.initForm();

    this.filteredCordIDs = this.setOnChange(this.fullCordIDsList, this.cordIDFormControl);

    this.filteredKpiBasenames = this.fullKpiBasenamesList.slice(0, 50);
    this.kpiBasenamesFormControl.valueChanges.subscribe((val) => {
      this.filterOptionsKpiBasename(val);
    });

    this.filteredAcronyms = this.acronymsByCordID.slice(0, 50);
    this.acronymsFormControl.valueChanges.subscribe(val => {
      this.filterOptionsAcronym(val);
    });
  }

  initForm() {
    this.draftParams = this.formBuilder.group({
      cordID: this.cordIDFormControl,
      acronyms: [this.selectedAcronyms],
      kpiBaseNames: [this.selectedKpiBasenames]
    });
  }

  getDraft(draftParams: FormGroup) {

  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }


  // kpi basenames
  addChipKpiBasename(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedKpiBasenames.push(selection);
    this.fullKpiBasenamesList = this.fullKpiBasenamesList.filter(obj => obj !== selection);
    this.filteredKpiBasenames = this.fullKpiBasenamesList.slice(0, 50);
    if (input) {
      input.value = '';
    }
  }

  // add(event: MatChipInputEvent): void {
  //   let input = event.input;
  //   let value = event.value;
  //   console.log(value)
  //   if ((value || '').trim()) {
  //     this.selectedAcronyms.push(value);
  //   }
  //   if (input) {
  //     input.value = '';
  //   }
  // }

  removeChipKpiBasename(chip: any): void {
    const index = this.selectedKpiBasenames.indexOf(chip);
    if (index >= 0) {
      this.selectedKpiBasenames.splice(index, 1);
      this.fullKpiBasenamesList.push(chip);
    }
  }

  filterOptionsKpiBasename(opt: string) {
    this.filteredKpiBasenames = this.fullKpiBasenamesList
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0).slice(0, 50);
  }


  // acronyms
  addChipAcronym(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedAcronyms.push(selection);
    this.acronymsByCordID = this.acronymsByCordID.filter(obj => obj !== selection);
    this.filteredAcronyms = this.acronymsByCordID.slice(0, 50);
    if (input) {
      input.value = '';
    }
  }

  removeChipAcronym(chip: any): void {
    const index = this.selectedAcronyms.indexOf(chip);
    if (index >= 0) {
      this.selectedAcronyms.splice(index, 1);
      this.acronymsByCordID.push(chip);
    }
  }

  filterOptionsAcronym(opt: string) {
    this.filteredAcronyms = this.acronymsByCordID
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0).slice(0, 50);
  }
}

