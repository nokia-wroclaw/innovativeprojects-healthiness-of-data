import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {MatSnackBar} from '@angular/material';

declare var Chart: any;

@Component({
  selector: 'app-outliers',
  templateUrl: './outliers.component.html',
  styleUrls: ['./outliers.component.css']
})
export class OutliersComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  outlierParams: FormGroup;
  startDate: any;
  endDate: any;
  kpiBaseName: any;
  acronym: any;
  cordID: any;
  outliersChartLoading = false;
  outliersChartLoaded = false;

  labels: any = [];

  outlierData: any = [];
  outlierDates: any = [];
  outlierIndexes: any = [];
  outlierValues: any = [];

  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);


  outlierDatesFormatted: any = [];

  dataGapsFilled: any = [];
  outliersGapsFilled: any = [];
  chartElement;
  myChart;
  fetchedIn: any;

  constructor(private router: Router,
              private restService: RestService,
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
    this.outlierParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      threshold: ''
    });
  }

  getOutliers(outliersParams) {
    console.log('outliers params');
    console.log(outliersParams);
    this.outliersChartLoading = true;
    this.startDate = outliersParams.value.startDate;
    this.endDate = outliersParams.value.endDate;
    this.kpiBaseName = outliersParams.value.kpiBaseName;
    this.cordID = outliersParams.value.cordID;
    this.acronym = outliersParams.value.acronym;
    this.startDate = this.sharedFunctions.parseDate(outliersParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(outliersParams.value.endDate);
    let url = 'api/outliers/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate
      + '&kpi_basename=' + this.kpiBaseName.toUpperCase();

    if (outliersParams.value.threshold) {
      url += '&threshold=' + outliersParams.value.threshold;
    }
    let start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        let end = new Date().getTime();
        this.fetchedIn = end - start;
        console.log('outlierData: ');
        console.log(response.data);
        this.outliersChartLoading = false;
        this.outlierData = response.data.values;
        this.outlierValues = response.data.outlier_values;
        this.outlierIndexes = response.data.outliers;
        this.outlierDates = response.data.dates;
        this.clearPreviousChartData();

        this.generateDates();
        this.outliersChartLoaded = true;
        this.updateChart(this.myChart);
      } else {
        this.sharedFunctions.openSnackBar('Error: ' + response['status'], 'OK');
      }
    });


  }

  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      this.labels.push(this.sharedFunctions.parseDate(itr.next().toDate()));
    }

    for (let i = 0; i < this.outlierDates.length; i++) {
      this.outlierDatesFormatted.push(this.sharedFunctions.parseDate(new Date(this.outlierDates[i])));
    }
    this.fillGaps();
  }

  fillGaps() {
    for (let i = 0, j = 0, k = 0; i < this.labels.length; i++) {
      if (this.labels[i] === this.outlierDatesFormatted[j]) {
        this.dataGapsFilled.push(this.outlierData[j]);
        j++;
      } else {
        this.dataGapsFilled.push(null);
      }
      if (this.outlierIndexes[k] === i) {
        this.outliersGapsFilled.push(this.outlierValues[k]);
        k++;
      } else {
        this.outliersGapsFilled.push(null);
      }
    }
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  clearPreviousChartData() {
    this.labels.length = 0;
    this.dataGapsFilled.length = 0;
    this.outliersGapsFilled.length = 0;
    this.outlierDatesFormatted.length = 0;
    console.log('previous chart data cleared');
  }

  generateChart() {
    this.myChart = new Chart(this.chartElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Normal Data',
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)',
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
          label: 'Outliers',
          data: this.outliersGapsFilled,
          backgroundColor: 'rgba(160, 0, 0, 1)',
          borderColor: 'rgba(160, 0, 0, 1)',
          borderWidth: 1,
          fill: false,
          pointRadius: 2,
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

  updateChart(chart) {
    const newData = chart.data = {
      labels: this.labels,
      datasets: [{
        label: 'Normal Data',
        data: this.dataGapsFilled,
        backgroundColor: 'rgba(0, 0, 160, 1)',
        borderColor: 'rgba(0, 0, 160, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }, {
        label: 'Outliers',
        data: this.outliersGapsFilled,
        backgroundColor: 'rgba(160, 0, 0, 1)',
        borderColor: 'rgba(160, 0, 0, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 2,
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
    this.outlierParams.patchValue({
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Skuntank',
      acronym: 'dilfihess',
      kpiBaseName: 'SGSN_2012'
    });
    this.sharedFunctions.openSnackBar('you\'re lazy', 'very true');
  }
}



