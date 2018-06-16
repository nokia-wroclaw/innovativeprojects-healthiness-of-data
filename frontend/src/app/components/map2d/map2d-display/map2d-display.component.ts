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

  preStartDate: any;
  startDate: any;
  endDate: any;

  kpiBaseName: string;
  fetchedIn: number;

  problem = false;
  problemMessage: any;

  mapData: any;

  map2DLoading = false;
  map2DLoaded = false;

  map2DDisplayComponent = Map2DDisplayComponent;
  matrixTotals: any = [];

  cordIds: any = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.map2DChartId = 'map2DChart' + this.id.toString();
    console.log(this.params);
    this.map2DParams = this.params.map2DParams;
    this.cordIds = this.params.cordIDs;
    for (let i = 0; i < this.cordIds.length; i++) {
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
    this.preStartDate = this.sharedFunctions.parseDate(this.map2DParams.value.preStartDate);
    this.kpiBaseName = this.map2DParams.value.kpiBaseName;

    const cordIDsURL = this.sharedFunctions.processArguments(this.cordIds, 'cord_id');

    let url = 'api/clusters/map2D/RNC_31' + '?date_start=' + this.startDate + '&date_end=' + this.endDate + cordIDsURL;

    if (this.preStartDate !== undefined) {
      url += '&pre_start_date' + this.preStartDate;
    }

    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        console.log(response.data);
        const positions = response.data.positions;
        const totals = response.data.matrix_totals;

        for (let i = 0; i < this.cordIds.length; i++) {
          for (let j = 0; j < this.cordIds.length; j++) {
            this.matrixTotals[i][j] = totals[i][j].toFixed(3);
          }
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
    this.map2DChart = new Chart(this.map2DChartElement, {
      type: 'scatter',
      data: {
        labels: this.cordIds,
        datasets: [{
          label: 'cords 2D map',
          data: positions,
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)'
        }]
      },
      options: {
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return data.labels[tooltipItem.index];
              // return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
            }
          }
        },
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }]
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
}
