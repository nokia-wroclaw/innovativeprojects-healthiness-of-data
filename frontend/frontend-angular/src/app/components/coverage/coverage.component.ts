import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatChipInputEvent} from '@angular/material';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import {ENTER, COMMA, TAB} from '@angular/cdk/keycodes';

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

  coverageParams: FormGroup;
  coverageData: any = [];

  kpiBaseNames: any = [];
  acronyms: any = [];
  startDate: string;
  endDate: string;

  coverageTableLoaded = false;
  coverageTableLoading = false;

  separatorKeysCodes = [ENTER, COMMA, TAB];

  selectedKpiBasenames: any = ['TRF_215', 'SGSN_2012'];
  allKpiBasenamesList: any = [];
  optionsKpiBasenames: any = [];
  kpiBasenamesFormControl: FormControl = new FormControl();

  selectedAcronyms: any = ['strathatuk', 'drasheshu'];
  allAcronymslist = ['childott', 'drasheshu', 'khuxel', 'bliulfux', 'strathatuk'];
  optionsAcronyms: any = [];
  acronymsFormControl: FormControl = new FormControl();


  selectable = true;
  removable = true;
  addOnBlur = true;

  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder,
              private cacheData: CacheDataComponent) {
    // this.allKpiBasenamesList = this.cacheData.getKpiBasenamesList();
  }

  ngOnInit() {
    this.initForm();
    this.getKpiFull();
    this.optionsKpiBasenames = this.allKpiBasenamesList;
    this.kpiBasenamesFormControl.valueChanges.subscribe((val) => {
      this.filterOptionsKpiBasename(val);
    });

    this.optionsAcronyms = this.allAcronymslist;
    this.acronymsFormControl.valueChanges.subscribe(val => {
      this.filterOptionsAcronym(val);
    });
  }

  public getCoverage(coverageParams): void {
    console.log('coverage params');
    console.log(coverageParams);
    this.coverageTableLoading = true;

    this.startDate = this.parseDate(coverageParams.value.startDate);
    this.endDate = this.parseDate(coverageParams.value.endDate);

    const baseURL = 'api/clusters/coverage/?date_start=' + this.startDate + '&date_end=' + this.endDate;

    const kpiBaseNamesURL = this.processArguments(this.selectedKpiBasenames, 'kpi_basename');
    const acronymsURL = this.processArguments(this.selectedAcronyms, 'acronym');

    const url = baseURL + kpiBaseNamesURL + acronymsURL;
    console.log(url);
    this.restService.getAll(url).then(response => {
      console.log('coverageData: ');
      console.log(response.data);
      this.coverageTableLoading = false;
      this.coverageData = response.data;
      this.coverageTableLoaded = true;
    });

  }

  initForm() {
    this.coverageParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordId: ['', Validators.required],
      kpiBaseNames: [this.selectedKpiBasenames],
      acronyms: [this.selectedAcronyms]
    });
  }

  getKpiFull() {
    console.log('get kpi full');
    this.restService.getAll('api/fetch_kpi_basenames').then(kpiFull => {
      this.allKpiBasenamesList = kpiFull.data;
    });
  }

  // kpi basenames
  addChipKpiBasename(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedKpiBasenames.push(selection);
    this.allKpiBasenamesList = this.allKpiBasenamesList.filter(obj => obj !== selection);
    this.optionsKpiBasenames = this.allKpiBasenamesList;
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
      this.allKpiBasenamesList.push(chip);
    }
    this.coverageTableLoaded = false;
  }

  filterOptionsKpiBasename(opt: string) {
    this.optionsKpiBasenames = this.allKpiBasenamesList
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0);
  }


  // acronyms
  addChipAcronym(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedAcronyms.push(selection);
    this.allAcronymslist = this.allAcronymslist.filter(obj => obj !== selection);
    this.optionsAcronyms = this.allAcronymslist;
    if (input) {
      input.value = '';
    }
    this.coverageTableLoaded = false;
  }

  removeChipAcronym(chip: any): void {
    const index = this.selectedAcronyms.indexOf(chip);
    if (index >= 0) {
      this.selectedAcronyms.splice(index, 1);
      this.allAcronymslist.push(chip);
    }
    this.coverageTableLoaded = false;
  }

  filterOptionsAcronym(opt: string) {
    this.optionsAcronyms = this.allAcronymslist
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0);
  }


  processArguments(argumentsList: string[], argumentName: string): string {
    let argURL = '';
    argumentsList.forEach((arg) => {
      if (arg !== '') {
        argURL += '&' + argumentName + '=' + arg;
      }
    });
    return argURL;
  }

  parseDate(date: any): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) ;
  }


}



