import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-outliers',
  templateUrl: './outliers.component.html',
  styleUrls: ['./outliers.component.css']
})
export class OutliersComponent implements OnInit {

  outlierParams: FormGroup;
  startDate: any;
  endDate: any;
  kpiBaseNames: string[];
  acronym: string[];
  cordId: string[];
  outliersChartLoading = false;
  outliersChartLoaded = false;

  cordAcronymSet: any = [];
  cordIdsList: any = [];
  filteredAcronyms: any = [];
  cordIdsFiltered: Observable<string[]>;
  acronymsFiltered: Observable<string[]>;
  kpisFiltered: Observable<string[]>;
  labels: any = [];

  allKpiBasenamesList: any = [];
  optionsKpiBasenames: any = [];

  fullData: any = [];
  fullOutlierData: any = [];

  outlierData: any = [];
  outlierDates: any = [];
  outlierIndexes: any = [];
  outlierValues: any = [];
  cordIdControl = new FormControl('', [Validators.required]);
  acronymControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);


  outlierDatesFormatted: any = [];

  dataGapsFilled: any = [];
  outliersGapsFilled: any = [];
  chart;
  myChart;


  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService) {
  }

  ngOnInit() {
    this.initForm();
    this.chart = document.getElementById('myChart');
    this.generateChart();
    this.getCordAcronymSet();
    this.getCordIdsList();
    this.getKpiFull();
    this.cordIdControl.valueChanges.subscribe(cor => {
      this.filteredAcronyms = this.cordAcronymSet[cor];
    });

  }

  getOutliers(outliersParams) {
    console.log('coverage params');
    console.log(outliersParams);
    this.outliersChartLoading = true;
    this.startDate = outliersParams.value.startDate;
    this.endDate = outliersParams.value.endDate;
    this.kpiBaseNames = outliersParams.value.kpiBaseNames.split(/[\s,]+/);
    this.cordId = outliersParams.value.cordId;
    this.acronym = outliersParams.value.acronym;
    this.startDate = this.sharedFunctions.parseDate(outliersParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(outliersParams.value.endDate);
    const baseURL = 'api/outliers/' + this.cordId + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate;

    let kpiBaseNamesURL = '';

    this.kpiBaseNames.forEach((kpi) => {
      if (kpi !== '') {
        kpiBaseNamesURL += '&kpi_basename=' + kpi;
      }
    });
    let url = baseURL + kpiBaseNamesURL;
    if (outliersParams.value.threshold) {
      url += '&threshold=' + outliersParams.value.threshold;
    }
    console.log(url);
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        console.log('outlierData: ');
        console.log(response.data);
        this.outliersChartLoading = false;
        this.outlierData = response.data.values;
        this.outlierValues = response.data.outlier_values;
        this.outlierIndexes = response.data.outliers;
        this.outlierDates = response.data.dates;
        this.clearPreviousChartData();
      } else {

      }
    }).then(() => {
      this.generateDates();
    }).then(() => {
      this.generateLabels();
      this.outliersChartLoaded = true;
    }).then(() => {
      this.updateChart(this.myChart, this.labels);
    });

  }

  initForm() {
    this.outlierParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      kpiBaseNames: this.kpiBasenamesFormControl,
      acronym: this.acronymControl,
      cordId: this.cordIdControl,
      threshold: ''
    });
  }


  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      const fullDate = itr.next().toDate();
      this.labels.push(this.sharedFunctions.parseDate(fullDate));
    }

    for (let i = 0; i < this.outlierDates.length; i++) {
      this.outlierDatesFormatted.push(this.sharedFunctions.parseDate(new Date(this.outlierDates[i])));
    }
    this.fillGaps();
  }

  generateLabels() {
    let x = 0;
    for (let i = 0; i < this.outlierData.length; i++) {
      if (i === this.outlierIndexes[x]) {
        this.fullOutlierData.push({x: i, y: this.outlierData[i]});
        x += 1;
      } else {
        this.fullData.push({x: i, y: this.outlierData[i]});
      }
    }
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

  clearPreviousChartData() {
    this.labels.length = 0;
    this.dataGapsFilled.length = 0;
    this.outliersGapsFilled.length = 0;
    this.outlierDatesFormatted.length = 0;
    console.log('previous chart data cleared');
  }

  getCordAcronymSet() {
    this.restService.getAll('api/fetch_cord_acronym_set').then((response) => {
      this.cordAcronymSet = response.data;
      this.acronymsFiltered = this.acronymControl.valueChanges
        .pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.filteredAcronyms, 50)));
    });
  }

  getCordIdsList() {
    this.restService.getAll('api/fetch_cord_ids').then((response) => {
      this.cordIdsList = response.data;
      this.cordIdsFiltered = this.cordIdControl.valueChanges
        .pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.cordIdsList, 100)));
    });
  }

  getKpiFull() {
    this.restService.getAll('api/fetch_kpi_basenames').then(kpiFull => {
      this.allKpiBasenamesList = kpiFull.data;
      this.kpisFiltered = this.kpiBasenamesFormControl.valueChanges
        .pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.allKpiBasenamesList, 50)));
    });
  }

  generateChart() {
    this.myChart = new Chart(this.chart, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Normal Data',
          data: this.dataGapsFilled,
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

  updateChart(chart, label) {
    let ddd = chart.data = {
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

    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(ddd);
    });
    chart.update();
    console.log('chart updated');
  }


}



