import {Component, DoCheck, Injectable, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Injectable()
@Component({
  selector: 'app-decomposition-display',
  templateUrl: './decomposition-display.component.html',
  styleUrls: ['./decomposition-display.component.css']
})
export class DecompositionDisplayComponent implements OnInit, OnChanges {



  @Input() decompositionParams: FormGroup;
  @Input() formSubmitted = false;

  decompositionChartLoading = false;
  decompositionChartLoaded = false;
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
  trendChart;
  seasonalChart;

  trendChartElement;
  seasonalChartElement;

  startDate: any;
  endDate: any;
  kpiBaseName: any;
  acronym: any;
  cordID: any;

  fetchedIn: any;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService) {
  }

  ngOnInit() {
    console.log('child initalized');
    this.trendChartElement = document.getElementById('trendChart2');
    this.seasonalChartElement = document.getElementById('seasonalChart2');
    this.sharedFunctions.hideElement(this.trendChartElement);
    this.sharedFunctions.hideElement(this.seasonalChartElement);
    this.generateTrendChart();
    this.generateSeasonalChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formSubmitted) {
      this.sharedFunctions.hideElement(this.trendChartElement);
      this.sharedFunctions.hideElement(this.seasonalChartElement);

      this.decompositionChartLoading = true;
      this.startDate = this.decompositionParams.value.startDate;
      this.endDate = this.decompositionParams.value.endDate;
      this.kpiBaseName = this.decompositionParams.value.kpiBaseName;
      this.cordID = this.decompositionParams.value.cordID;
      this.acronym = this.decompositionParams.value.acronym;
      this.startDate = this.sharedFunctions.parseDate(this.decompositionParams.value.startDate);
      this.endDate = this.sharedFunctions.parseDate(this.decompositionParams.value.endDate);
      let url = 'api/decomposition/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate
        + '&kpi_basename=' + this.kpiBaseName.toUpperCase();

      if (this.decompositionParams.value.frequency) {
        url += '&frequency=' + this.decompositionParams.value.frequency;
      }

      let start = new Date().getTime();
      this.restService.getAll(url).then(response => {
        if (response['status'] === 200) {
          console.log(response.data);
          if (response.data.error) {
            this.sharedFunctions.openSnackBar(response.data.error, 'OK');
            this.decompositionChartLoading = false;
          } else {
            let end = new Date().getTime();
            this.fetchedIn = end - start;
            this.decompositionChartLoading = false;
            this.observedDates = response.data.observed_dates;
            this.observedValues = response.data.observed_values;

            this.seasonalDates = response.data.seasonal_dates;
            this.seasonalValues = response.data.seasonal_values;

            this.trendDates = response.data.trend_dates;
            this.trendValues = response.data.trend_values;


            this.clearPreviousChartData();
            this.fixTrend(this.decompositionParams.value.frequency / 2);
            this.generateDates();
            this.decompositionChartLoaded = true;
            this.updateTrendChart(this.trendChart);
            this.updateSeasonalChart(this.seasonalChart);
          }

        } else {
          this.sharedFunctions.openSnackBar('Error: ' + response.data.error, 'OK');
          this.decompositionChartLoading = false;
        }
      });
    }
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

  generateTrendChart() {
    this.trendChart = new Chart(this.trendChartElement, {
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
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Trend chart'
        },
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

  generateSeasonalChart() {
    this.seasonalChart = new Chart(this.seasonalChartElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
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
        title: {
          display: true,
          text: 'Seasonal chart'
        },
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

  updateTrendChart(chart): any {
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
    console.log('trend chart updated');
    this.sharedFunctions.showElement(this.trendChartElement);

  }

  updateSeasonalChart(chart): any {
    const newData = chart.data = {
      labels: this.labels,
      datasets: [{
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
    console.log('seasonal chart updated');
    this.sharedFunctions.showElement(this.seasonalChartElement);
  }
}
