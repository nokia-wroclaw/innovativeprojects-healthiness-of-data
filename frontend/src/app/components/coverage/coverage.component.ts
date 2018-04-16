import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material';
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
  selectedKpiBasenames: any = ['TRF_215', 'SGSN_2012'];
  filteredKpiBasenames: any = [];
  filteredAcronyms: any = [];

  coverageData: any = [];

  kpiBaseNames: any = [];
  acronyms: any = [];
  startDate: string;
  endDate: string;
  cordID: any;

  coverageTableLoaded = false;
  coverageTableLoading = false;

  separatorKeysCodes = [ENTER, COMMA, TAB];


  selectedAcronyms: any = ['strathatuk', 'drasheshu'];


  coverageParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);
  acronymsFormControl: FormControl = new FormControl('', [Validators.required]);

  selectable = true;
  removable = true;
  addOnBlur = true;

  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder,
              private cacheData: CacheDataComponent,
              private sharedFunctions: SharedFunctionsService) {
    this.fullKpiBasenamesList = this.cacheData.getKpiBasenamesList();
    this.fullCordIDsList = this.cacheData.getFullCordIDsList();
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
    this.coverageParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronyms: [this.selectedAcronyms],
      kpiBaseNames: [this.selectedKpiBasenames]
    });
  }

  public getCoverage(coverageParams): void {
    console.log('coverage params');
    console.log(coverageParams);
    this.coverageTableLoading = true;
    this.startDate = this.sharedFunctions.parseDate(coverageParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(coverageParams.value.endDate);
    this.cordID = this.coverageParams.value.cordID;
    console.log(this.cordID);
    const baseURL = 'api/coverage/' + this.cordID + '?date_start=' + this.startDate + '&date_end=' + this.endDate;
    this.selectedKpiBasenames = this.selectedKpiBasenames.map((e) => {
      return e.toUpperCase();
    });
    const kpiBaseNamesURL = this.sharedFunctions.processArguments(this.selectedKpiBasenames, 'kpi_basename');

    const acronymsURL = this.sharedFunctions.processArguments(this.selectedAcronyms, 'acronym');
    const url = baseURL + kpiBaseNamesURL + acronymsURL;
    this.restService.getAll(url).then(response => {
      console.log('coverageData: ');
      console.log(response.data);
      this.coverageTableLoading = false;
      this.coverageData = response.data;
      this.coverageTableLoaded = true;
    });
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
    this.coverageTableLoaded = false;
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
    this.coverageTableLoaded = false;
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
    this.coverageTableLoaded = false;
  }

  removeChipAcronym(chip: any): void {
    const index = this.selectedAcronyms.indexOf(chip);
    if (index >= 0) {
      this.selectedAcronyms.splice(index, 1);
      this.acronymsByCordID.push(chip);
    }
    this.coverageTableLoaded = false;
  }

  filterOptionsAcronym(opt: string) {
    this.filteredAcronyms = this.acronymsByCordID
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0).slice(0, 50);
  }

}