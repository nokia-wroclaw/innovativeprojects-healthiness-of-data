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
  temporaryLabel: string;
  temporaryLabel2: string;


  cordAcronymSet: any = [];
  cordIdsList: any = [];
  filteredAcronyms: any = [];
  cordIdsFiltered: Observable<string[]>;
  acronymsFiltered: Observable<string[]>;

  fullData: any = [];
  fullHistogramData: any = [];

  histogramData: any = [];
  histogramDates: any = [];
  histogramIndexes: any = [];
  histogramValues: any = [];
  properLabels: any = [];
  cordIdControl = new FormControl('', [Validators.required]);
  acronymControl = new FormControl('', [Validators.required]);  

  histogramDatesFormatted: any = [];

  chart;
  myChart;
  chartCreated = false;
  MAX: string;
  MIN: string;
  COVERAGE: string;
  MEAN: string;
  DEVIATION: string;

  constructor(private router: Router,
              private restService: RestService,
              private formBuilder: FormBuilder) {
  }


  ngOnInit() {
    this.initForm();
    this.chart = document.getElementById('myChart');
    this.MAX = '0';
    this.MIN = '0';
    this.COVERAGE = '0';
    this.MEAN = '0';
    this.DEVIATION = '0';
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

  getHistograms(histogramsParams) {
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
    const baseURL = 'api/clusters/aggregates' + '/' + this.cordId + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate + '&kpi_basename=' + this.kpiBaseName;

    let url = baseURL;
    console.log(url);
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        console.log('histogramData: ');
        console.log(response.data);
        this.histogramChartLoading = false;
        this.histogramData = response.data;
        this.histogramValues = response.data.distribution[0];
        this.histogramIndexes = response.data.distribution[1];
        this.MAX = response.data.max_val;
        this.MIN = response.data.min_val;
        this.COVERAGE = response.data.coverage;
        this.MEAN = response.data.mean;
        this.DEVIATION = response.data.std_deviation;
        this.clearPreviousChartData();
      } 
    }).then(() => {
      this.generateLabels();
      this.histogramChartLoaded = true;
    }).then(() => {
      this.updateChart(this.myChart, this.properLabels);
    });
  }
  clearPreviousChartData() {
    this.properLabels.length = 0;
    console.log('previous chart data cleared');
  }
  updateChart(chart, label) {
    let ddd = chart.data = {
      labels: this.properLabels,
      datasets: [{
        label: 'Data',
        data: this.histogramValues,
        backgroundColor: 'rgba(0, 0, 160, 1)',
        borderColor: 'rgba(0, 0, 160, 1)',
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
        labels: this.properLabels,
        datasets: [ {
          label: 'Data',
          data: this.histogramValues,
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)',
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
  generateLabels() {
    for (let i = 0; i < this.histogramIndexes.length - 1; i++) {
          this.properLabels.push("|" + this.histogramIndexes[i].toString().slice(0, 5) + ":" + this.histogramIndexes[i+1].toString().slice(0, 5));
        }
  }

}
