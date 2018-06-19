import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';
import {RestService} from '../../../shared/services/rest.service';

declare var Chart: any;

@Component({
  selector: 'app-coverage-display',
  templateUrl: './coverage-display.component.html',
  styleUrls: ['./coverage-display.component.css']
})
export class CoverageDisplayComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  coverageParams: FormGroup;

  coverageChartId = 'coverageChart';
  coverageChartElement;
  coverageChart;
  fetchedIn: any;
  problem = false;
  problemMessage: any;

  startDate: string;
  endDate: string;
  cordID: string;
  acronyms: any = [];
  kpiBaseNames: any = [];
  coverageData: any = [];
  coverageTableLoaded = false;
  coverageTableLoading = false;

  labels: any = [];
  datasetTitles: any = [];
  datasetDatesFormatted: any = [];
  datasets: any = [];


  coverageDisplayComponent = CoverageDisplayComponent;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.coverageParams = this.params.coverageParams;
    this.acronyms = JSON.parse(JSON.stringify(this.params.acronyms));
    this.kpiBaseNames = JSON.parse(JSON.stringify(this.params.kpiBaseNames));
    this.coverageChartId = 'coverageChart' + this.id.toString();
  }

  ngAfterViewInit(): void {
    this.coverageChartElement = document.getElementById(this.coverageChartId);
    this.sharedFunctions.hideElement(this.coverageChartElement);

    this.coverageTableLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.coverageParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.coverageParams.value.endDate);
    this.cordID = this.coverageParams.value.cordID;

    const baseURL = 'api/coverage/' + this.cordID + '?date_start=' + this.startDate + '&date_end=' + this.endDate;

    this.kpiBaseNames = this.kpiBaseNames.map((e) => {
      return e.toUpperCase();
    });
    const kpiBaseNamesURL = this.sharedFunctions.processArguments(this.kpiBaseNames, 'kpi_basename');
    const acronymsURL = this.sharedFunctions.processArguments(this.acronyms, 'acronym');

    const url = baseURL + kpiBaseNamesURL + acronymsURL + '&gap_size=' + this.coverageParams.value.gapSize;
    const start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        this.coverageData = response.data;

        this.labels = this.generateLabels(this.startDate, this.endDate);
        for (let i = 0; i < this.coverageData.length; i++) {
          this.datasetTitles.push(this.coverageData[i].acronym + ' ' + this.coverageData[i].kpi_basename);
          this.datasetDatesFormatted.push(this.formatDates(this.coverageData[i].dates));
          const rgb = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
          this.datasets.push({

            label: this.datasetTitles[i],
            data: this.fillGaps(this.datasetDatesFormatted[i], i),
            backgroundColor: rgb,
            borderColor: rgb,
            borderWidth: 3,
            fill: false,
            pointRadius: 3,
            pointBorderWidth: 0
          });
        }

        this.generateCoverageChart();
        this.coverageTableLoaded = true;
      } else {
        this.problem = true;
        this.problemMessage = 'Error: ' + response.status + ' - ' + response.data.error;
      }
      this.coverageTableLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.problem = true;
      this.problemMessage = 'Error: backend error';
      this.coverageTableLoading = false;
    });
  }


  generateLabels(startDate: string, endDate: string) {
    const moment = require('moment');
    require('twix');
    const labels = [];
    const itr = moment.twix(new Date(startDate), new Date(endDate)).iterate('days');
    while (itr.hasNext()) {
      labels.push(this.sharedFunctions.parseDate(itr.next().toDate()));
    }
    return labels;
  }

  formatDates(dates: any) {
    const datesFormatted = [];
    for (let i = 0; i < dates.length; i++) {
      datesFormatted.push(this.sharedFunctions.parseDate(new Date(dates[i])));
    }
    return datesFormatted;
  }

  fillGaps(datesFormatted: any, index: number) {
    const dataset = [];
    for (let i = 0, j = 0; i < this.labels.length; i++) {
      if (this.labels[i] === datesFormatted[j]) {
        dataset.push(index);
        j++;
      } else {
        dataset.push(null);
      }
    }
    return dataset;
  }

  generateCoverageChart() {
    this.coverageChart = new Chart(this.coverageChartElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        title: {
          display: true,
          text: 'Coverage chart'
        },
        spanGaps: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              stepSize: 1
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
    this.sharedFunctions.showElement(this.coverageChartElement);
  }

  removeComponent() {
    console.log('component removed: ' + this.id);
    const toRemove = {
      removeId: this.id,
      typeOfComponent: this.coverageDisplayComponent
    };
    this.removeId.emit(toRemove);
  }
}
