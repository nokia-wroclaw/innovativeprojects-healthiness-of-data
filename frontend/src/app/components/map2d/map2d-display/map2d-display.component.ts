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

  @Input() params: FormGroup;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  map2DParams: FormGroup;

  map2DChartId = 'outliersChart';
  map2DChartElement;
  map2DChart;

  startDate: any;
  endDate: any;
  cordID1: string;
  cordID2: string;
  kpiBaseName: string;
  fetchedIn: number;

  problem = false;
  problemMessage: any;

  mapData: any;

  map2DLoading = false;
  map2DLoaded = false;

  map2DDisplayComponent = Map2DDisplayComponent;
  total: any;
  correlationList = [];
  acrs1 = [];
  acrs2 = [];
  matrix: any;


  cord_list = ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel', 'Pelipper', 'Piplup', 'Rotom', 'Vigoroth', 'Timburr', 'Raticate'];
  arr = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
    for (let i = 0; i < this.cord_list.length; i++) {
      this.arr[i] = [];
      for (let j = 0; j < this.cord_list.length; j++) {
        if (i === j) {
          this.arr[i][j] = 'x';
        }
      }
    }
  }

  ngOnInit() {
    this.map2DChartId = 'map2DChart' + this.id.toString();
    this.map2DParams = this.params;
  }

  ngAfterViewInit(): void {
    this.map2DChartElement = document.getElementById(this.map2DChartId);
    this.sharedFunctions.hideElement(this.map2DChartElement);


    this.map2DLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.map2DParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.map2DParams.value.endDate);
    this.cordID1 = this.map2DParams.value.cordID1;
    this.cordID2 = this.map2DParams.value.cordID2;
    this.kpiBaseName = this.map2DParams.value.kpiBaseName;


    // const url = 'api/clusters/map2D/' + this.cordID1 + '/' + this.cordID2 + '/' + this.kpiBaseName + '?date_start=' + this.startDate + '&date_end=' + this.endDate;

    const url = 'api/clusters/map2D_v2/RNC_31' + '?date_start=' + this.startDate + '&date_end=' + this.endDate;
    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        console.log(response.data);
        const positions = response.data.positions;
        const totals = response.data.matrix_totals;

        for (let i = 0; i < this.cord_list.length; i++) {
          for (let j = 0; j < this.cord_list.length; j++) {
            if (i === j) {
              this.arr[i][j] = 'x';
            } else if (i < j) {
              this.arr[i][j] = totals[i][j].toFixed(3);
              this.arr[j][i] = totals[i][j].toFixed(3);
            }
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
        labels: this.cord_list,
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
              const label = data.labels[tooltipItem.index];
              return label + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
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
