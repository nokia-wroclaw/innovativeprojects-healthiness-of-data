import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram-display',
  templateUrl: './aggregates-histogram-display.component.html',
  styleUrls: ['./aggregates-histogram-display.component.css']
})
export class AggregatesHistogramDisplayComponent implements OnInit, AfterViewInit {

  @Input() histogramParams: FormGroup;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<number>();

  histogramChartId = 'histogramChart';

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
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.histogramChartId = 'histogramChartId' + this.id.toString();
  }

  ngAfterViewInit(): void {
    this.chart = document.getElementById(this.histogramChartId);
    this.sharedFunctions.hideElement(this.chart);

    this.histogramChartLoading = true;
    this.cdRef.detectChanges();
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
      this.histogramChartLoading = false;
      if (response['status'] === 200) {
        let end = new Date().getTime();
        this.fetchedIn = end - start;
        this.histogramData = response.data;
        this.histogramValues = response.data.distribution[0];
        this.histogramIndexes = response.data.distribution[1];
        this.max = response.data.max_val;
        this.min = response.data.min_val;
        this.coverage = (parseFloat(response.data.coverage) * 100).toFixed(3) + '%';
        this.mean = parseFloat(response.data.mean).toFixed(3);
        this.deviation = parseFloat(response.data.std_deviation).toFixed(3);

        this.generateLabels();
        this.histogramChartLoaded = true;
        this.generateChart();
      } else {
        this.sharedFunctions.openSnackBar('Error: ' + response.status + ' - ' + response.data.error, 'OK');
      }
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.sharedFunctions.openSnackBar('Error: ' + 'backend error', 'OK');
    });
  }

  generateLabels() {
    for (let i = 0; i < this.histogramIndexes.length - 1; i++) {
      this.labels.push('|' + this.histogramIndexes[i].toString().slice(0, 5) + ':' + this.histogramIndexes[i + 1].toString().slice(0, 5) + ']');
    }
  }

  generateChart() {
    this.myChart = new Chart(this.chart, {
      type: 'bar',
      data: {
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
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        spanGaps: false,
        elements: {
          line: {
            skipNull: true,
            drawNull: false,
          }
        }
      }
    });
    this.sharedFunctions.showElement(this.chart);
  }

  removeComponent() {
    console.log('component removed');
    this.removeId.emit(this.id);
  }
}
