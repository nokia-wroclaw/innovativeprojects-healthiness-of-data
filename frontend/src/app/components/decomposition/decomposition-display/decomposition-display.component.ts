import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Injectable()
@Component({
  selector: 'app-decomposition-display',
  templateUrl: './decomposition-display.component.html',
  styleUrls: ['./decomposition-display.component.css']
})
export class DecompositionDisplayComponent implements OnInit, AfterViewInit {

  @Input() params: FormGroup;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  decompositionParams: FormGroup;

  trendChartId = 'trendChart';
  seasonalChartId = 'seasonalChart';
  trendChartElement;
  seasonalChartElement;
  trendChart;
  seasonalChart;
  fetchedIn: number;

  startDate: any;
  endDate: any;
  cordID: string;
  acronym: string;
  kpiBaseName: string;
  decompositionChartLoading = false;
  decompositionChartLoaded = false;

  labels: any = [];

  observedDates: any;
  observedValues: any;
  seasonalValues: any;
  trendValues: any;

  decompositionDatesFormatted: any = [];
  observedGapsFilled: any = [];
  seasonalGapsFilled: any = [];
  trendValuesFixed: any = [];
  trendGapsFilled: any = [];

  decompositionDisplayComponent = DecompositionDisplayComponent;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.trendChartId = 'trendChart' + this.id.toString();
    this.seasonalChartId = 'seasonalChart' + this.id.toString();
    this.decompositionParams = this.params;
  }

  ngAfterViewInit(): void {
    this.trendChartElement = document.getElementById(this.trendChartId);
    this.seasonalChartElement = document.getElementById(this.seasonalChartId);
    this.sharedFunctions.hideElement(this.trendChartElement);
    this.sharedFunctions.hideElement(this.seasonalChartElement);

    this.decompositionChartLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.decompositionParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.decompositionParams.value.endDate);
    this.cordID = this.decompositionParams.value.cordID;
    this.acronym = this.decompositionParams.value.acronym;
    this.kpiBaseName = this.decompositionParams.value.kpiBaseName;

    const url = this.sharedFunctions.generateURL(this.decompositionParams, 'decomposition');
    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      this.decompositionChartLoading = false;
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;

        this.observedDates = response.data.observed_dates;
        this.observedValues = response.data.observed_values;
        this.seasonalValues = response.data.seasonal_values;
        this.trendValues = response.data.trend_values;

        this.fixTrend(this.decompositionParams.value.frequency / 2);
        const generatedDates = this.sharedFunctions.generateDates(this.startDate, this.endDate, this.observedDates);
        this.labels = generatedDates[0];
        this.decompositionDatesFormatted = generatedDates[1];
        this.fillGaps();
        this.generateTrendChart();
        this.generateSeasonalChart();
        this.decompositionChartLoaded = true;
        this.decompositionChartLoading = false;
      } else {
        this.sharedFunctions.openSnackBar('Error ' + response.status + ': ' + response.data.error, 'OK');
      }

    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.sharedFunctions.openSnackBar('Error: ' + 'backend error', 'OK');
    });

  }

  fixTrend(missing: number) {
    const missingArray = new Array<number>(Math.floor(missing));
    missingArray.forEach((nan) => {
      nan = null;
    });
    this.trendValuesFixed = missingArray;
    this.trendValuesFixed = this.trendValuesFixed.concat(this.trendValues, missingArray);
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

  removeComponent() {
    console.log('component removed: ' + this.id);
    const toRemove = {
      removeId: this.id,
      typeOfComponent: this.decompositionDisplayComponent
    };
    this.removeId.emit(toRemove);
  }

  generateTrendChart() {
    this.trendChart = new Chart(this.trendChartElement, {
      type: 'line',
      data: {
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
      },
      options: {
        title: {
          display: true,
          text: 'Trend chart'
        },
        responsive: true,
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
    this.sharedFunctions.showElement(this.trendChartElement);
  }

  generateSeasonalChart() {
    this.seasonalChart = new Chart(this.seasonalChartElement, {
      type: 'line',
      data: {
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
      },
      options: {
        title: {
          display: true,
          text: 'Seasonal chart'
        },
        responsive: true,
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
    this.sharedFunctions.showElement(this.seasonalChartElement);
  }
}
