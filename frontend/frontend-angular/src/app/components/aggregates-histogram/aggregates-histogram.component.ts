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
  kpiBaseNames: string[];
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

  dataGapsFilled: any = [];
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


  initForm() {
    this.histogramParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      kpiBaseNames: ['', Validators.required],
      acronym: this.acronymControl,
      cordId: this.cordIdControl,
      threshold: ''
    });
  }
  generateChart() {
    console.log('generating chart...');

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
          data: this.histogramsGapsFilled,
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

}
