import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-map2d-display',
  templateUrl: './map2d-display.component.html',
  styleUrls: ['./map2d-display.component.css']
})
export class Map2DDisplayComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  map2DParams: FormGroup;

  map2DChartId = 'outliersChart';
  map2DChartElement;
  map2DChart;

  otherDate: any;
  startDate: any;
  endDate: any;

  kpiBaseName: string;
  fetchedIn: number;

  problem = false;
  problemMessage: any;

  mapData: any;

  map2DLoading = false;
  map2DLoaded = false;
  showHeatmap = false;

  map2DDisplayComponent = Map2DDisplayComponent;
  matrixTotals: any = [];
  heatmap: any = [];
  gradientMatrix: any = [];
  maxHeat = -999999999.0;
  minHeat = 999999999.0;

  cordIds: any = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.map2DChartId = 'map2DChart' + this.id.toString();
    this.map2DParams = this.params.map2DParams;
    this.cordIds = JSON.parse(JSON.stringify(this.params.cordIDs));

    for (let i = 0; i < this.cordIds.length; i++) {
      this.heatmap[i] = [];
      this.gradientMatrix[i] = [];
      this.matrixTotals[i] = [];
    }
  }

  ngAfterViewInit(): void {
    this.map2DChartElement = document.getElementById(this.map2DChartId);
    this.sharedFunctions.hideElement(this.map2DChartElement);

    this.map2DLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.map2DParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.map2DParams.value.endDate);
    this.kpiBaseName = this.map2DParams.value.kpiBaseName;

    const cordIDsURL = this.sharedFunctions.processArguments(this.cordIds, 'cord_id');

    let url = 'api/clusters/map2D/RNC_31' + '?date_start=' + this.startDate + '&date_end=' + this.endDate + cordIDsURL;

    if (!!this.map2DParams.value.otherDate) {
      this.otherDate = this.sharedFunctions.parseDate(this.map2DParams.value.otherDate);
      url += '&date_other=' + this.otherDate;
    }

    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        console.log(response.data);
        const positions = response.data.positions;
        const totals = response.data.matrix_totals;
        if (response.data.heatmap !== undefined) {
          this.showHeatmap = true;
        }

        for (let i = 0; i < this.cordIds.length; i++) {
          for (let j = 0; j < this.cordIds.length; j++) {
            this.matrixTotals[i][j] = totals[i][j].toFixed(3);
            if (i === j) {
              this.matrixTotals[i][j] = 'x';
            }
            if (response.data.heatmap !== undefined) {
              this.heatmap[i][j] = (response.data.heatmap[i][j] * 100).toFixed(3);
              const hm = this.heatmap[i][j];
              if (parseFloat(hm) > this.maxHeat) {
                this.maxHeat = hm;
              }
              if (parseFloat(hm) < this.minHeat) {
                this.minHeat = hm;
              }
              if (i === j) {
                this.heatmap[i][j] = 'x';
              }
            }
          }
        }
        if (response.data.heatmap !== undefined) {
          this.getGradient();
        }
        this.generateChart(positions);
        this.map2DLoaded = true;
      } else {
        this.problem = true;
        this.problemMessage = 'Error: ' + response.status + ' - ' + response.data.error;
      }
      this.map2DLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.problem = true;
      this.problemMessage = 'Error: ' + 'backend error';
      this.map2DLoading = false;
    });
  }

  generateChart(positions: any) {
    const datasets = this.generateDatasets(positions);
    this.map2DChart = new Chart(this.map2DChartElement, {
      type: 'scatter',
      data: {
        labels: this.cordIds,
        datasets: datasets
      },
      options: {
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return data.labels[tooltipItem.datasetIndex];
            }
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              display: false
            }
          }],
        }
      }
    });
    this.sharedFunctions.showElement(this.map2DChartElement);
  }

  removeComponent() {
    console.log('component removed: ' + this.id);
    const toRemove = {
      removeId: this.id,
      typeOfComponent: this.map2DDisplayComponent
    };
    this.removeId.emit(toRemove);
  }

  generateDatasets(data: any[]) {
    const datasets = [];
    for (let i = 0; i < this.cordIds.length; i++) {
      const rgb1 = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
      const rgb2 = 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
      datasets[i] = {
        label: this.cordIds[i],
        data: [{
          x: data[i].x,
          y: data[i].y
        }],
        backgroundColor: rgb1,
        borderColor: rgb2,
        borderWidth: 3,
        radius: 10,
      };
    }
    return datasets;
  }

  getGradient() {
    for (let i = 0; i < this.cordIds.length; i++) {
      for (let j = 0; j < this.cordIds.length; j++) {
        const val = this.heatmap[i][j];
        if (val > 0) {
          // if (val / this.maxHeat <= 0.1) {
          //   this.gradientMatrix[i][j] = 'rgba(255, 255, 0,' + (val / this.minHeat).toFixed(2) + ')';
          // } else {
          //   this.gradientMatrix[i][j] = 'rgba(0, 255, 0,' + (val / this.maxHeat).toFixed(2) + ')';
          // }
          this.gradientMatrix[i][j] = 'rgba(0, 255, 0,' + (val / this.maxHeat).toFixed(2) + ')';
        } else if (val < 0) {
          // if (val / this.minHeat <= 0.1) {
          //   this.gradientMatrix[i][j] = 'rgba(255, 255, 0,' + (val / this.minHeat).toFixed(2) + ')';
          // } else {
          //   this.gradientMatrix[i][j] = 'rgba(255, 0, 0,' + (val / this.minHeat).toFixed(2) + ')';
          // }
          this.gradientMatrix[i][j] = 'rgba(255, 0, 0,' + (val / this.minHeat).toFixed(2) + ')';
        }
      }
    }
  }

  parseToPercent(value: string) {
    if (value === 'x') {
      return value;
    } else {
      return Math.round(parseFloat(value)) + '%';
    }
  }
}
