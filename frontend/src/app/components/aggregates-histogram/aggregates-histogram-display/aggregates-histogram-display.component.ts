import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';
import {GridsterConfig, GridsterItem} from 'angular-gridster2';

declare var Chart: any;

@Component({
  selector: 'app-aggregates-histogram-display',
  templateUrl: './aggregates-histogram-display.component.html',
  styleUrls: ['./aggregates-histogram-display.component.css']
})
export class AggregatesHistogramDisplayComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  histogramParams: FormGroup;

  histogramChartId = 'histogramChart';
  histogramChartElement;
  histogramChart;
  fetchedIn: any;
  problem = false;
  problemMessage: any;

  startDate: any;
  endDate: any;
  cordID: string;
  acronym: string;
  kpiBaseName: string;
  histBins: number;
  histogramChartLoading = false;
  histogramChartLoaded = false;

  labels: any = [];

  histogramData: any = [];
  histogramIndexes: any = [];
  histogramValues: any = [];

  max: string;
  min: string;
  coverage: string;
  mean: string;
  deviation: string;

  histogramDisplayComponent = AggregatesHistogramDisplayComponent;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.histogramChartId = 'histogramChartId' + this.id.toString();
    this.histogramParams = this.params;
  }

  ngAfterViewInit(): void {
    this.histogramChartElement = document.getElementById(this.histogramChartId);
    this.sharedFunctions.hideElement(this.histogramChartElement);

    this.histogramChartLoading = true;
    this.cdRef.detectChanges();
    this.cordID = this.histogramParams.value.cordID;
    this.acronym = this.histogramParams.value.acronym;
    this.kpiBaseName = this.histogramParams.value.kpiBaseName;

    const url = this.sharedFunctions.generateURL(this.histogramParams, 'histogram');
    const start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        this.histogramData = response.data;
        this.histogramValues = response.data.distribution[0];
        this.histogramIndexes = response.data.distribution[1];
        this.max = response.data.max_val;
        this.min = response.data.min_val;
        this.coverage = (parseFloat(response.data.coverage) * 100).toFixed(3) + '%';
        this.mean = parseFloat(response.data.mean).toFixed(3);
        this.deviation = parseFloat(response.data.std_deviation).toFixed(3);

        this.generateLabels();
        this.generateChart();
        this.histogramChartLoaded = true;
      } else {
        this.problem = true;
        this.problemMessage = 'Error: ' + response.status + ' - ' + response.data.error;
      }
      this.histogramChartLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.problem = true;
      this.problemMessage = 'Error: ' + 'backend error';
    });
  }

  generateLabels() {
    for (let i = 0; i < this.histogramIndexes.length - 1; i++) {
      this.labels.push('|' + this.histogramIndexes[i].toString().slice(0, 5) + ':' + this.histogramIndexes[i + 1].toString().slice(0, 5) + ']');
    }
  }

  removeComponent() {
    console.log('component removed: ' + this.id);
    const toRemove = {
      removeId: this.id,
      typeOfComponent: this.histogramDisplayComponent
    };
    this.removeId.emit(toRemove);
  }

  generateChart() {
    this.histogramChart = new Chart(this.histogramChartElement, {
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
    this.sharedFunctions.showElement(this.histogramChartElement);
  }
}
