import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram',
  templateUrl: './aggregates-histogram.component.html',
  styleUrls: ['./aggregates-histogram.component.css']
})
export class AggregatesHistogramComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  startDate: any;
  endDate: any;
  kpiBaseName: any;
  acronym: any;
  cordID: any;
  histogramChartLoading = false;
  histogramChartLoaded = false;

  histogramData: any = [];
  histogramIndexes: any = [];
  histogramValues: any = [];
  properLabels: any = [];

  histogramParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  chart;
  myChart;
  max: string;
  min: string;
  coverage: string;
  mean: string;
  deviation: string;
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
    this.chart = document.getElementById('myChart');
    this.max = '0';
    this.min = '0';
    this.coverage = '0';
    this.mean = '0';
    this.deviation = '0';
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
    this.histogramParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl
    });
  }

  getHistogram(histogramParams) {
    console.log('coverage params');
    console.log(this.histogramParams);
    this.histogramChartLoading = true;
    this.startDate = histogramParams.value.startDate;
    this.endDate = histogramParams.value.endDate;
    this.kpiBaseName = histogramParams.value.kpiBaseName;
    this.cordID = histogramParams.value.cordID;
    this.acronym = histogramParams.value.acronym;
    this.startDate = this.sharedFunctions.parseDate(histogramParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(histogramParams.value.endDate);
    const url = 'api/clusters/aggregates' + '/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate + '&kpi_basename=' + this.kpiBaseName.toUpperCase();

    let start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response['status'] === 200) {
        let end = new Date().getTime();
        this.fetchedIn = end - start;
        console.log('histogram data: ');
        console.log(response.data);
        this.histogramChartLoading = false;
        this.histogramData = response.data;
        this.histogramValues = response.data.distribution[0];
        this.histogramIndexes = response.data.distribution[1];
        this.max = response.data.max_val;
        this.min = response.data.min_val;
        this.coverage = response.data.coverage;
        this.mean = response.data.mean;
        this.deviation = response.data.std_deviation;
        this.clearPreviousChartData();

        this.generateLabels();
        this.histogramChartLoaded = true;
        this.updateChart(this.myChart);
      } else {
        this.sharedFunctions.openSnackBar('Error: ' + response['status'], 'OK');
      }
    });
  }

  clearPreviousChartData() {
    this.properLabels.length = 0;
    console.log('previous chart data cleared');
  }

  generateLabels() {
    for (let i = 0; i < this.histogramIndexes.length - 1; i++) {
      this.properLabels.push('|' + this.histogramIndexes[i].toString().slice(0, 5) + ':' + this.histogramIndexes[i + 1].toString().slice(0, 5) + ']');
    }
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.sharedFunctions.filter(val, full, 100)));
  }

  generateChart() {
    this.myChart = new Chart(this.chart, {
      type: 'bar',
      data: {
        labels: this.properLabels,
        datasets: [{
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

  updateChart(chart) {
    const newData = chart.data = {
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
      dataset.data.push(newData);
    });
    chart.update();
    console.log('chart updated');
  }


  imLazy() {
    console.log('you re lazy');
    this.histogramParams.patchValue({
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Skuntank',
      acronym: 'dilfihess',
      kpiBaseName: 'SGSN_2012'
    });
    this.sharedFunctions.openSnackBar('you\'re lazy', 'very true');
  }
}
