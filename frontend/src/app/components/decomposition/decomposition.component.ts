import {Component, OnInit} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {forEach} from '@angular/router/src/utils/collection';

declare var Chart: any;

@Component({
  selector: 'app-decomposition',
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.css']
})
export class DecompositionComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  observedDates: any;
  observedValues: any;
  seasonalDates: any;
  seasonalValues: any;
  trendDates: any;
  trendValues: any;

  decompositionDatesFormatted: any = [];
  observedGapsFilled: any = [];
  seasonalGapsFilled: any = [];
  trendValuesFixed: any = [];
  trendGapsFilled: any = [];


  labels: any = [];
  myChart;
  chartElement;

  decompositionChartLoading = false;
  decompositionChartLoaded = false;

  startDate: any;
  endDate: any;
  kpiBaseName: any;
  acronym: any;
  cordID: any;

  decompositionParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  fetchedIn: any;

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
    this.chartElement = document.getElementById('myChart');
    this.generateChart();
    this.filteredKpiBasenames = this.setOnChange(this.fullKpiBasenamesList, this.kpiBasenameFormControl);
    this.filteredCordIDs = this.setOnChange(this.fullCordIDsList, this.cordIDFormControl);
    // this.filteredAcronyms = this.setOnChange(this.acronymsByCordID, this.acronymFormControl);
    this.filteredAcronyms = this.acronymFormControl.valueChanges.pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.acronymsByCordID, 50)));

    this.cordIDFormControl.valueChanges.subscribe((cord) => {
      this.acronymsByCordID = this.fullCordIDsAcronymsSet[cord];
    });

  }

  initForm() {
    this.decompositionParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      frequency: 31
    });
  }


  getDecomposition(decompositionParams: FormGroup) {
    console.log('decomposition params');
    console.log(decompositionParams);
    this.decompositionChartLoading = true;
    this.startDate = decompositionParams.value.startDate;
    this.endDate = decompositionParams.value.endDate;
    this.kpiBaseName = decompositionParams.value.kpiBaseName;
    this.cordID = decompositionParams.value.cordID;
    this.acronym = decompositionParams.value.acronym;
    this.startDate = this.sharedFunctions.parseDate(decompositionParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(decompositionParams.value.endDate);
    let url = 'api/decomposition/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate
      + '&kpi_basename=' + this.kpiBaseName.toUpperCase();


    if (decompositionParams.value.frequency) {
      url += '&frequency=' + decompositionParams.value.frequency;
    }

    let start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        let end = new Date().getTime();
        console.log(response.data);
        this.decompositionChartLoading = false;
        this.fetchedIn = end - start;
        this.observedDates = response.data.observed_dates;
        this.observedValues = response.data.observed_values;

        this.seasonalDates = response.data.seasonal_dates;
        this.seasonalValues = response.data.seasonal_values;

        this.trendDates = response.data.trend_dates;
        this.trendValues = response.data.trend_values;


        this.clearPreviousChartData();
        this.fixTrend(decompositionParams.value.frequency / 2);
        this.generateDates();
        this.decompositionChartLoaded = true;
        this.updateChart(this.myChart);

      } else {
        this.sharedFunctions.openSnackBar('Error: ' + response['status'], 'OK');
        this.decompositionChartLoading = false;
      }
    });


  }

  fixTrend(missing: number) {
    let missingArray = new Array<number>(Math.floor(missing));
    missingArray.forEach((nan) => {
      nan = null;
    });
    this.trendValuesFixed = missingArray;
    this.trendValuesFixed = this.trendValuesFixed.concat(this.trendValues, missingArray);
    return;
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      this.labels.push(this.sharedFunctions.parseDate(itr.next().toDate()));
    }

    for (let i = 0; i < this.observedDates.length; i++) {
      this.decompositionDatesFormatted.push(this.sharedFunctions.parseDate(new Date(this.observedDates[i])));
    }
    this.fillGaps();
  }

  fillGaps() {
    for (let i = 0, j = 0; i < this.labels.length; i++) {
      if (this.labels[i] === this.decompositionDatesFormatted[j]) {
        this.observedGapsFilled.push(this.observedValues[j]);
        this.seasonalGapsFilled.push(this.seasonalValues[j]);
        this.trendGapsFilled.push(this.trendValuesFixed[j]);
        j++;
      } else {
        this.observedGapsFilled.push(null);
        this.seasonalGapsFilled.push(null);
        this.trendGapsFilled.push(null);
      }
    }
  }

  clearPreviousChartData(): any {
    this.labels.length = 0;
    this.observedGapsFilled.length = 0;
    this.seasonalGapsFilled.length = 0;
    this.trendGapsFilled.length = 0;
    this.decompositionDatesFormatted.length = 0;
    console.log('previous chart data cleared');
    return;
  }

  generateChart() {
    this.myChart = new Chart(this.chartElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Observed',
          backgroundColor: 'rgba(0, 0, 160, 0.5)',
          borderColor: 'rgba(0, 0, 160, 0.5)',
          borderWidth: 1,
          fill: false,
          pointRadius: 1,
          pointBorderWidth: 1,
          options: {
            spanGaps: true,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: false
                }
              }]
            }
          }
        }, {
          label: 'Trend',
          data: {},
          backgroundColor: 'rgba(0, 160, 0, 1)',
          borderColor: 'rgba(0, 160, 0, 1)',
          borderWidth: 1,
          fill: false,
          pointRadius: 1,
          pointBorderWidth: 1,
          options: {
            spanGaps: false,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: false
                }
              }]
            }, elements: {
              line: {
                skipNull: true,
                drawNull: false,
              }
            }
          }
        }, {
          label: 'Seasonal',
          data: {},
          backgroundColor: 'rgba(160, 0, 0, 1)',
          borderColor: 'rgba(160, 0, 0, 1)',
          borderWidth: 1,
          fill: false,
          pointRadius: 1,
          pointBorderWidth: 1,
          options: {
            spanGaps: false,
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: false
                }
              }]
            }, elements: {
              line: {
                skipNull: true,
                drawNull: false,
              }
            }
          }
        }]
      },
      options: {
        responsive: true,
        zoom: {
          enabled: true,
          mode: 'x',
          drag: true

        },
        spanGaps: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        }, elements: {
          line: {
            skipNull: true,
            drawNull: false,
          }
        }
      }
    });


  }

  updateChart(chart): any {
    const newData = chart.data = {
      labels: this.labels,
      datasets: [{
        label: 'Observed',
        data: this.observedGapsFilled,
        backgroundColor: 'rgba(0, 0, 160, 0.5)',
        borderColor: 'rgba(0, 0, 160, 0.5)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }, {
        label: 'Trend',
        data: this.trendGapsFilled,
        backgroundColor: 'rgba(0, 160, 0, 1)',
        borderColor: 'rgba(0, 160, 0, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }, {
        label: 'Seasonal',
        data: this.seasonalGapsFilled,
        backgroundColor: 'rgba(160, 0, 0, 1)',
        borderColor: 'rgba(160, 0, 0, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }]
    };

    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(newData);
    });
    chart.update();
    console.log('chart updated');
  }

  imLazy() {
    console.log('you re lazy');
    this.decompositionParams.patchValue({
      startDate: new Date('2017-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Skuntank',
      acronym: 'dilfihess',
      kpiBaseName: 'SGSN_2012'
    });
    this.sharedFunctions.openSnackBar('Autocompleted', 'OK');
  }
}
