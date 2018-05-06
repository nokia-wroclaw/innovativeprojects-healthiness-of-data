import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram-display',
  templateUrl: './aggregates-histogram-display.component.html',
  styleUrls: ['./aggregates-histogram-display.component.css']
})
export class AggregatesHistogramDisplayComponent implements OnInit, OnChanges {

  @Input() histogramParams: FormGroup;
  @Input() formSubmitted;

  startDate: any;
  endDate: any;
  kpiBaseName: any;
  acronym: any;
  cordID: any;
  histBins: any;
  histogramChartLoading = false;
  histogramChartLoaded = false;

  histogramData: any = [];
  histogramIndexes: any = [];
  histogramValues: any = [];
  labels: any = [];

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
              private sharedFunctions: SharedFunctionsService) {
  }

  ngOnInit() {
    this.chart = document.getElementById('myChart');
    this.sharedFunctions.hideElement(this.chart);
    this.generateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formSubmitted) {
      this.sharedFunctions.hideElement(this.chart);
      this.histogramChartLoading = true;
      this.startDate = this.histogramParams.value.startDate;
      this.endDate = this.histogramParams.value.endDate;
      this.kpiBaseName = this.histogramParams.value.kpiBaseName;
      this.cordID = this.histogramParams.value.cordID;
      this.acronym = this.histogramParams.value.acronym;
      this.startDate = this.sharedFunctions.parseDate(this.histogramParams.value.startDate);
      this.endDate = this.sharedFunctions.parseDate(this.histogramParams.value.endDate);
      this.histBins = this.histogramParams.value.histBins;
      if (typeof this.histBins == 'undefined') {
        this.histBins = 10;
      }
      const url = 'api/clusters/aggregates' + '/' + this.cordID + '/' + this.acronym + '?date_start=' + this.startDate + '&date_end=' + this.endDate + '&kpi_basename=' + this.kpiBaseName.toUpperCase() + '&bins=' + this.histBins;
      let start = new Date().getTime();
      this.restService.getAll(url).then(response => {
        if (response['status'] === 200) {
          console.log(response.data);
          if (response.data.error) {
            this.sharedFunctions.openSnackBar(response.data.error, 'OK');
            this.histogramChartLoading = false;
          } else {
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
            this.coverage = (parseFloat(response.data.coverage) * 100).toFixed(3) + '%';
            this.mean = parseFloat(response.data.mean).toFixed(3);
            this.deviation = parseFloat(response.data.std_deviation).toFixed(3);
            this.clearPreviousChartData();

            this.generateLabels();
            this.histogramChartLoaded = true;
            this.updateChart(this.myChart);
          }
        } else {
          this.sharedFunctions.openSnackBar('Error: ' + response.status + ' - ' + response.data.error, 'OK');
          this.histogramChartLoading = false;
        }
      });
    }
  }

  clearPreviousChartData() {
    this.labels.length = 0;
    console.log('previous chart data cleared');
  }

  generateLabels() {
    for (let i = 0; i < this.histogramIndexes.length - 1; i++) {
      this.labels.push('|' + this.histogramIndexes[i].toString().slice(0, 5) + ':' + this.histogramIndexes[i + 1].toString().slice(0, 5) + ']');
    }
  }

  generateChart() {
    this.myChart = new Chart(this.chart, {
      type: 'bar',
      data: {},
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
    this.sharedFunctions.showElement(this.chart);
  }

}
