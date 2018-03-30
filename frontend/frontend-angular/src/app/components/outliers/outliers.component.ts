import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../services/rest.service';

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


  labels: any = [];

  fullData: any = [];
  fullOutlierData: any = [];

  outlierData: any = [];
  outlierDates: any = [];
  outlierIndexes: any = [];
  outlierValues: any = [];

  outlierDatesFormatted: any = [];

  dataGapsFilled: any = [];
  outliersGapsFilled: any = [];

  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
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
    this.startDate = this.parseDate(outliersParams.value.startDate);
    this.endDate = this.parseDate(outliersParams.value.endDate);
    const baseURL = 'api/operators/outliers/' + this.cordId + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate;

    let kpiBaseNamesURL = '';

    this.kpiBaseNames.forEach((kpi) => {
      if (kpi !== '') {
        kpiBaseNamesURL += '&kpi_basename=' + kpi;
      }
    });
    const url = baseURL + kpiBaseNamesURL;
    if (outliersParams.value.threshold) {
      url += '&threshold=' + outliersParams.value.threshold;
    }
    console.log(url);
    this.restService.getAll(url).then(response => {
      console.log('outlierData: ');
      console.log(response.data);
      this.outliersChartLoading = false;
      this.outlierData = response.data.values;
      this.outlierValues = response.data.outlier_values;
      this.outlierIndexes = response.data.outliers;
      this.outlierDates = response.data.dates;

    }).then(() => {
      this.generateDates();
    }).then(() => {
      this.generateLabels();
      this.outliersChartLoaded = true;
      console.log(this.outlierData);
    }).then(() => {
      this.generateChart();
    });

  }

  initForm() {
    this.outlierParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      kpiBaseNames: ['', Validators.required],
      acronym: ['', Validators.required],
      cordId: ['', Validators.required],
      threshold: ''
    });
  }

  generateChart() {
    console.log('generating chart...');
    let chart = document.getElementById('myChart');
    let myChart = new Chart(chart, {
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
        }
      }
    });
    myChart.update();


  }

  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      const fullDate = itr.next().toDate();
      this.labels.push(this.parseDate(fullDate));
    }

    for (let i = 0; i < this.outlierDates.length; i++) {
      let newDate = new Date(this.outlierDates[i]);
      this.outlierDatesFormatted.push(this.parseDate(newDate));
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

  parseDate(date: any): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + (date.getDate() + 1)).slice(-2);
  }

  fillGaps() {
    console.log('values');
    console.log(this.outlierValues);
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
    console.log('gaps filled:');
    console.log(this.dataGapsFilled);
    console.log('outliers filled');
    console.log(this.outliersGapsFilled);
  }

}


