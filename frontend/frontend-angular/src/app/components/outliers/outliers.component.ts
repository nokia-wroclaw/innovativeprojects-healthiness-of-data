import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
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
  data: any = [1, 2, 3, 4, 1, 1, 1, 2, 3, 1, 4, 5, 3, 1, 2, 3, 4, 1, 1, 1, 2, 3, 1, 4, 5, 3, 1, 2, 3, 4];
  labels: any = [];

  startDate: any;
  endDate: any;
  outliersChartLoading = false;
  outliersChartLoaded = false;
  fullData: any = [];
  fullOutlierData: any = [];
  kpiBaseNames: string[];
  acronym: string[];
  cordId: string[];
  outliersData: any = [];
  outliersDates: any = [];

  gapsFilled: any = [];

  outliersIndexes: any = [];
  outliersValues: any = [];
  myChart: any;


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
    console.log(url);
    this.restService.getAll(url).then(response => {
      console.log('outliersData: ');
      console.log(response.data);
      this.outliersChartLoading = false;
      this.outliersData = response.data.values;
      this.outliersValues = response.data.outlier_values;
      this.outliersIndexes = response.data.outliers;
      this.outliersDates = response.data.dates;
      console.log(this.outliersIndexes);
      this.generateDates();

    }).then(() => {
      this.generateLabels();
      this.outliersChartLoaded = true;
      console.log(this.outliersData);
    });

  }

  initForm() {
    this.outlierParams = this.formBuilder.group({
      startDate: '',
      endDate: '',
      kpiBaseNames: '',
      acronym: '',
      cordId: ''
    });
  }

  generateChart() {
    console.log('generating chart...');
    let chart = document.getElementById('myChart');
    this.myChart = new Chart(chart, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Outliers',
          data: this.fullOutlierData,
          backgroundColor: 'rgba(160, 0, 0, 1)',
          borderColor: 'rgba(160, 0, 0, 1)',
          borderWidth: 0.5,
          fill: false
        }, {
          label: 'Normal Data',
          data: this.fullData,
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)',
          borderWidth: 0.5,
          fill: false
        }

        ]
      },
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
    });

  }

  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      const fullDate = itr.next().toDate();
      const day = fullDate.getFullYear() + '-' + (fullDate.getMonth() + 1) + '-' + fullDate.getDate();
      this.labels.push(day);
    }
    console.log('dates: ' + this.labels.length);
    console.log(this.labels);
  }

  generateLabels() {
    let x = 0;
    for (let i = 0; i < this.outliersData.length; i++) {
      if (i === this.outliersIndexes[x]) {
        this.fullOutlierData.push({x: i, y: this.outliersData[i]});
        x += 1;
      } else {
        this.fullData.push({x: i, y: this.outliersData[i]});
      }
    }
    this.generateChart();

  }

  parseDate(date: any): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getDate();
  }

  fillGaps() {
    for (let i = 0, j = 0; i < this.labels.length; i++) {
      if (this.labels[i] === this.outliersDates[j]) {
        this.gapsFilled.push(this.outliersValues[j]);
        j++;
      } else {
        this.gapsFilled.push(null);
      }
    }
    console.log('gaps filled:');
    console.log(this.gapsFilled);
  }

}
