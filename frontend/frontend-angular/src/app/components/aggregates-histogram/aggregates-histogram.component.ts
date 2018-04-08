import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram',
  templateUrl: './aggregates-histogram.component.html',
  styleUrls: ['./aggregates-histogram.component.css']
})
export class AggregatesHistogramComponent implements OnInit {

  histogramParams: FormGroup
  startDate: any;
  endDate: any;
  kpiBaseName: string[];
  acronym: string[];
  cordId: string[];
  histogramChartLoading = false;
  histogramChartLoaded = false;

  cordAcronymSet: any = [];
  cordIdsList: any = [];
  filteredAcronyms: any = [];
  cordIdsFiltered: Observable<string[]>;
  acronymsFiltered: Observable<string[]>;
  labels: any = [];

  fullData: any = [];
  fullHistogramData: any = [];

  histogramData: any = [];
  histogramDates: any = [];
  histogramIndexes: any = [];
  histogramValues: any = [];
  cordIdControl = new FormControl('', [Validators.required]);
  acronymControl = new FormControl('', [Validators.required]);  

  histogramDatesFormatted: any = [];

  histogramsGapsFilled: any = [];
  chart;
  myChart;
  chartCreated = false;

  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder) {
  }


  ngOnInit() {
    this.initForm();
    this.chart = document.getElementById('myChart');
    this.generateChart();
    this.getCordAcronymSet();
    this.getCordIdsList();
    this.cordIdControl.valueChanges.subscribe(cor => {
      this.filteredAcronyms = this.cordAcronymSet[cor];
    });

  }
  parseDate(date: any): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + (date.getDate())).slice(-2);
  }

  getHistograms(outliersParams) {
    console.log('coverage params');
    console.log(this.histogramParams);
    this.histogramChartLoading = true;
    this.startDate = this.histogramParams.value.startDate;
    this.endDate = this.histogramParams.value.endDate;
    this.kpiBaseName = this.histogramParams.value.kpiBaseName;
    this.cordId = this.histogramParams.value.cordId;
    this.acronym = this.histogramParams.value.acronym;
    this.startDate = this.parseDate(this.histogramParams.value.startDate);
    this.endDate = this.parseDate(this.histogramParams.value.endDate);
    const baseURL = 'api/clusters/aggregates' + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate + '&kpi_basename=' + this.kpiBaseName;

    // let kpiBaseNamesURL = '';
    // kpiBaseNamesURL += '&kpi_basename=' + kpi;
    // let url = baseURL + kpiBaseNamesURL;
    // if (outliersParams.value.threshold) {
    //   url += '&threshold=' + outliersParams.value.threshold;
    // }
    let url = baseURL;
    console.log(url);
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        console.log('outlierData: ');
        console.log(response.data);
        console.log(response.data[0].distribution)
        this.histogramChartLoading = false;
        this.histogramData = response.data[0];
        this.histogramValues = response.data[0].distribution[1];
        this.histogramIndexes = response.data[0].distribution[0];
        this.histogramDates = response.data[0].distribution[0];
        this.clearPreviousChartData();
      } else {

      }
    }).then(() => {
      this.generateDates();
    }).then(() => {
      this.generateLabels();
      this.histogramChartLoaded = true;
      console.log(this.histogramData);
    }).then(() => {
      this.updateChart(this.myChart, this.labels);
    });

  }
  clearPreviousChartData() {
    this.labels.length = 0;
    this.histogramsGapsFilled.length = 0;
    this.histogramDatesFormatted.length = 0;
    console.log('previous chart data cleared');
  }
  updateChart(chart, label) {
    let ddd = chart.data = {
      labels: this.histogramIndexes,
      datasets: [{
        label: 'Normal Data',
        data: this.histogramValues,
        backgroundColor: 'rgba(0, 0, 160, 1)',
        borderColor: 'rgba(0, 0, 160, 1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 1,
        pointBorderWidth: 1
      }, {
        label: 'Outliers',
        data: this.histogramsGapsFilled,
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

  }

  initForm() {
    this.histogramParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      kpiBaseName: ['', Validators.required],
      acronym: this.acronymControl,
      cordId: this.cordIdControl,
    });
  }
  generateChart() {
    console.log('generating chart...');

    this.myChart = new Chart(this.chart, {
      type: 'bar',
      data: {
        labels: this.histogramIndexes,
        datasets: [ {
          label: 'histograms',
          data: this.histogramValues,
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
getCordAcronymSet() {
    this.restService.getAll('api/fetch_cord_acronym_set').then((response) => {
      this.cordAcronymSet = response.data;
      this.acronymsFiltered = this.acronymControl.valueChanges
        .pipe(startWith(''), map(val => this.filter(val, this.filteredAcronyms)));
    });
  }

  getCordIdsList() {
    this.restService.getAll('api/fetch_cord_ids').then((response) => {
      this.cordIdsList = response.data;
      this.cordIdsFiltered = this.cordIdControl.valueChanges
      .pipe(startWith(''), map(val => this.filter(val, this.cordIdsList)));
    });
  }
  filter(val: string, list: any): string[] {
    return list.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }
  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate('days');
    while (itr.hasNext()) {
      const fullDate = itr.next().toDate();
      this.labels.push(this.parseDate(fullDate));
    }

    for (let i = 0; i < this.histogramDates.length; i++) {
      let newDate = new Date(this.histogramDates[i]);
      this.histogramDatesFormatted.push(this.parseDate(newDate));
    }
  }

  generateLabels() {
    let x = 0;
    for (let i = 0; i < this.histogramData.length; i++) {
      if (i === this.histogramIndexes[x]) {
        this.fullHistogramData.push({x: i, y: this.histogramData[i]});
        x += 1;
      } else {
        this.fullData.push({x: i, y: this.histogramData[i]});
      }
    }
  }

}
