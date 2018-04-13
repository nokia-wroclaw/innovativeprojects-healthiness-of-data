import {Component, OnInit} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';
import {Observable} from 'rxjs/Observable';

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
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);

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

  }

  initForm() {
    this.decompositionParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseNames: this.kpiBasenamesFormControl,
      frequency: ''
    });
  }

  getDecomposition(decompositionParams: FormGroup) {
    console.log('decomposition params');
    console.log(decompositionParams);
    this.decompositionChartLoading = true;
    this.startDate = decompositionParams.value.startDate;
    this.endDate = decompositionParams.value.endDate;
    this.kpiBaseName = decompositionParams.value.kpiBaseNames;
    this.cordID = decompositionParams.value.cordID;
    this.acronym = decompositionParams.value.acronym;
    this.startDate = this.sharedFunctions.parseDate(decompositionParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(decompositionParams.value.endDate);
    let url = 'api/outliers/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate
      + '&kpi_basename=' + this.kpiBaseName.toUpperCase();


    if (decompositionParams.value.frequency) {
      url += '&frequency=' + decompositionParams.value.frequency;
    }

    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        console.log('outlierData: ');
        console.log(response.data);
        this.decompositionChartLoading = false;
        this.observedDates = response.data.observed_dates;
        this.observedValues = response.data.observed_values;

        this.seasonalDates = response.data.seasonal_dates;
        this.observedValues = response.data.seasonal_values;

        this.trendDates = response.data.trend_dates;
        this.trendValues = response.data.trend_values;

        this.clearPreviousChartData();
      } else {
        this.sharedFunctions.openSnackBar('Error: ' + response['status'], 'OK');
      }
    }).then(() => {
      this.generateDates();
    }).then(() => {
      this.decompositionChartLoaded = true;
    }).then(() => {
      this.updateChart(this.myChart, this.labels);
    });


  }


  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      this.labels.push(this.sharedFunctions.parseDate(itr.next().toDate()));
    }

    // for (let i = 0; i < this.outlierDates.length; i++) {
    //   this.outlierDatesFormatted.push(this.sharedFunctions.parseDate(new Date(this.outlierDates[i])));
    // }
    // this.fillGaps();
  }

  clearPreviousChartData() {
    this.labels.length = 0;
    console.log('previous chart data cleared');
  }

  generateChart() {
    this.myChart = new Chart(this.chartElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Observed',
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
          label: 'Seasonal',
          data: {},
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
        }, {
          label: 'Trend',
          data: {},
          backgroundColor: 'rgba(0, 160, 0, 1)',
          borderColor: 'rgba(0, 160, 0, 1)',
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

  updateChart(chart, label) {
    const newData = chart.data = {
      labels: this.labels,
      datasets: [{
        label: 'Observed',
        data: {},
        backgroundColor: 'rgba(0, 0, 160, 1)',
        borderColor: 'rgba(0, 0, 160, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }, {
        label: 'Seasonal',
        data: {},
        backgroundColor: 'rgba(160, 0, 0, 1)',
        borderColor: 'rgba(160, 0, 0, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 2,
        pointBorderWidth: 1
      }, {
        label: 'Trend',
        data: {},
        backgroundColor: 'rgba(0, 160, 0, 1)',
        borderColor: 'rgba(0, 160, 0, 1)',
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

    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(newData);
    });
    chart.update();
    console.log('chart updated');
  }
}
