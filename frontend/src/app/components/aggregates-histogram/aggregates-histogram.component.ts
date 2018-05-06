import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {MatDatepickerInputEvent} from '@angular/material';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram',
  templateUrl: './aggregates-histogram.component.html',
  styleUrls: ['./aggregates-histogram.component.css']
})
export class AggregatesHistogramComponent implements OnInit {

  histogramParamsReady: FormGroup;
  formSubmitted = false;

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  histogramParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);
  histBinsFormControl = new FormControl('',);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheData: CacheDataComponent) {
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

    this.histogramParams.valueChanges.subscribe(() => {
      this.formSubmitted = false;
    });
  }

  initForm() {
    this.histogramParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      histBins: this.histBinsFormControl
    });
  }

  getHistogram(histogramParams) {
    console.log('coverage params');
    console.log(this.histogramParams);
    this.histogramParamsReady = histogramParams;
    this.formSubmitted = true;
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  testSet1() {
    this.histogramParams.patchValue({
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Skuntank',
      acronym: 'dilfihess',
      kpiBaseName: 'SGSN_2012'
    });
  }
  testSet2() {
    this.histogramParams.patchValue({
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Barboach',
      acronym: 'ubrerm',
      kpiBaseName: 'RNC_31'
    });
  }
  testSet3() {
    this.histogramParams.patchValue({
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Magby',
      acronym: 'thruphroxtron',
      kpiBaseName: 'TRF_215'
    });
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }
}
