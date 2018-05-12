import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {MatDatepickerInputEvent} from '@angular/material';
import {ExamplesService} from '../../shared/services/examples.service';

@Component({
  selector: 'app-outliers',
  templateUrl: './outliers.component.html',
  styleUrls: ['./outliers.component.css']
})
export class OutliersComponent implements OnInit {

  outliersParamsReady: FormGroup;
  formSubmitted = false;

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  outliersParams: FormGroup;

  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheData: CacheDataComponent,
              public examplesService: ExamplesService) {
    this.fullKpiBasenamesList = this.cacheData.getKpiBasenamesList();
    this.fullCordIDsList = this.cacheData.getFullCordIDsList();
    this.fullCordIDsAcronymsSet = this.cacheData.getFullCordIDsAcronymsSet();
  }

  ngOnInit() {
    this.initForm();

    this.filteredKpiBasenames = this.setOnChange(this.fullKpiBasenamesList, this.kpiBasenameFormControl);
    this.filteredCordIDs = this.setOnChange(this.fullCordIDsList, this.cordIDFormControl);
    // this.filteredAcronyms = this.setOnChange(this.acronymsByCordID, this.acronymFormControl);
    this.filteredAcronyms = this.acronymFormControl.valueChanges.pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.acronymsByCordID, 50)));

    this.cordIDFormControl.valueChanges.subscribe((cord) => {
      this.acronymsByCordID = this.fullCordIDsAcronymsSet[cord];
    });
    this.outliersParams.valueChanges.subscribe(() => {
      this.formSubmitted = false;
    });
  }

  initForm() {
    this.outliersParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      threshold: '',
      windowSize: '',
    });
  }

  getOutliers(outliersParams: FormGroup) {
    console.log('outliers params');
    console.log(outliersParams);
    this.outliersParamsReady = outliersParams;
    this.formSubmitted = true;
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }
}



