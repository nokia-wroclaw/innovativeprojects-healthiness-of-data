import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-outliers-display',
  templateUrl: './outliers-display.component.html',
  styleUrls: ['./outliers-display.component.css']
})
export class OutliersDisplayComponent implements OnInit, OnChanges {


  @Input() outliersParams: FormGroup;
  @Input() formSubmitted = false;


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


  outlierDatesFormatted: any = [];

  dataGapsFilled: any = [];
  outliersGapsFilled: any = [];
  chartElement;
  myChart;
  fetchedIn: any;


  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService) {
  }

  ngOnInit() {
    this.chartElement = document.getElementById('outliersChart');
    this.sharedFunctions.hideElement(this.chartElement);
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formSubmitted) {
      this.sharedFunctions.hideElement(this.chartElement);
      this.outliersChartLoading = true;
      this.startDate = this.outliersParams.value.startDate;
      this.endDate = this.outliersParams.value.endDate;
      this.kpiBaseName = this.outliersParams.value.kpiBaseName;
      this.cordID = this.outliersParams.value.cordID;
      this.acronym = this.outliersParams.value.acronym;
      this.startDate = this.sharedFunctions.parseDate(this.outliersParams.value.startDate);
      this.endDate = this.sharedFunctions.parseDate(this.outliersParams.value.endDate);
      let url = 'api/outliers/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate
        + '&kpi_basename=' + this.kpiBaseName.toUpperCase();

      if (this.outliersParams.value.threshold) {
        url += '&threshold=' + this.outliersParams.value.threshold;
      }
      if (this.outliersParams.value.windowSize) {
        url += '&window_size=' + this.outliersParams.value.windowSize;
      }
      let start = new Date().getTime();
      this.restService.getAll(url).then(response => {
        if (response['status'] === 200) {
          if (response.data.error) {
            this.sharedFunctions.openSnackBar(response.data.error, 'OK');
            this.outliersChartLoading = false;
          } else {
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
          }
        } else {
          this.sharedFunctions.openSnackBar('Error: ' + response.status + ' - ' + response.data.error, 'OK');
          this.outliersChartLoading = false;
        }
      });
    }
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
      if (this.outlierValues[k] === this.dataGapsFilled[i]) {
        this.outliersGapsFilled.push(this.outlierValues[k]);
        k++;
      } else {
        this.outliersGapsFilled.push(null);
      }
    }
    console.log(this.outliersGapsFilled);
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
        backgroundColor: 'rgba(255, 153, 0, 1)',
        borderColor: 'rgba(255, 153, 0, 1)',
        borderWidth: 4,
        fill: false,
        pointRadius: 8,
        pointBorderWidth: 1,
        pointStyle: 'star',
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
    this.sharedFunctions.showElement(this.chartElement);
  }


}