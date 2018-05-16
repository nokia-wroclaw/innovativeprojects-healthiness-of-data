import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatChipInputEvent, MatDatepickerInputEvent} from '@angular/material';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';

import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {Observable} from 'rxjs/Observable';

@Component({
  moduleId: module.id,
  selector: 'app-coverage',
  templateUrl: './coverage.component.html',
  styleUrls: ['./coverage.component.css'],
  providers: [CacheDataComponent
    // {provide: MAT_DATE_LOCALE, useValue: 'pl-PL'},
    // {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    // {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ]
})
export class CoverageComponent implements OnInit {


  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;
  filteredKpiBasenames: Observable<string[]>;
  selectedAcronyms: any = [];
  selectedKpiBasenames: any = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  coverageParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);
  acronymsFormControl: FormControl = new FormControl('', [Validators.required]);

  selectable = true;
  removable = true;
  addOnBlur = true;

  formSubmitted = false;
  coverageParamsReady: FormGroup;
  selectedAcronymsReady: any = [];
  selectedKpiBaseNamesReady: any = [];

  @ViewChild('chipInputAcronym', {read: MatAutocompleteTrigger})
  private autoCompleteTrigger: MatAutocompleteTrigger;

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
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
    this.coverageParams.valueChanges.subscribe(() => {
      this.formSubmitted = false;
    });

  }

  initForm() {
    this.coverageParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronyms: [this.selectedAcronyms],
      kpiBaseNames: [this.selectedKpiBasenames],
      gapSize: 5
    });
  }


  public getCoverage(coverageParams): void {
    console.log('coverage params');
    console.log(coverageParams);
    this.coverageParamsReady = coverageParams;
    this.selectedAcronymsReady = this.selectedAcronyms;
    this.selectedKpiBaseNamesReady = this.selectedKpiBasenames;
    this.formSubmitted = true;

  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges.pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  // kpi basenames
  addChipKpiBasename(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedKpiBasenames.push(selection);
    this.formSubmitted = false;
    this.fullKpiBasenamesList = this.fullKpiBasenamesList.filter(obj => obj !== selection);
    this.filteredKpiBasenames = this.fullKpiBasenamesList.slice(0, 50);
    if (input) {
      input.value = '';
    }
  }

  removeChipKpiBasename(chip: any): void {
    const index = this.selectedKpiBasenames.indexOf(chip);
    this.formSubmitted = false;
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
    this.formSubmitted = false;
    this.acronymsByCordID = this.acronymsByCordID.filter(obj => obj !== selection);
    this.filteredAcronyms = this.acronymsByCordID;
    if (input) {
      input.value = '';
    }
  }

  // force add chip
  // add(event: MatChipInputEvent): void {
  //   let input = event.input;
  //   let value = event.value;
  //   if ((value || '').trim()) {
  //     this.selectedAcronyms.push(value);
  //   }
  //   if (input) {
  //     input.value = '';
  //   }
  // }

  removeChipAcronym(chip: any): void {
    const index = this.selectedAcronyms.indexOf(chip);
    this.formSubmitted = false;
    if (index >= 0) {
      this.selectedAcronyms.splice(index, 1);
      this.acronymsByCordID.push(chip);
    }
  }

  filterOptionsAcronym(opt: string) {
    this.filteredAcronyms = this.acronymsByCordID
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0);
  }

  filterAcronyms($event: MatAutocompleteSelectedEvent, inputCord: any) {
    this.acronymsByCordID.length = 0;
    this.selectedAcronyms.length = 0;
    this.acronymsByCordID = this.fullCordIDsAcronymsSet[inputCord.value];
  }

  inputFocus() {
    if (this.selectedAcronyms.length === 0) {
      this.filterOptionsAcronym('');
    }
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }

  imLazy() {
    this.coverageParams.patchValue({
      startDate: new Date('2016-09-01T00:00:00.000Z'),
      endDate: new Date('2018-03-01T00:00:00.000Z'),
      cordID: 'Mr. Mime',
    });
    this.selectedAcronyms = ['threarirzearr', 'toubrishik', 'threghix'];
    this.selectedKpiBasenames = ['TRF_215', 'RNC_31'];
  }
}
