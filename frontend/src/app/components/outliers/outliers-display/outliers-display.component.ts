import {
  AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

declare var Chart: any;

@Component({
  selector: 'app-outliers-display',
  templateUrl: './outliers-display.component.html',
  styleUrls: ['./outliers-display.component.css']
})
export class OutliersDisplayComponent implements OnInit, AfterViewInit {

  @Input() outliersParams: FormGroup;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<number>();

  outliersChartId = 'outliersChart';
  outliersChartElement;
  outliersChart;
  fetchedIn: number;

  startDate: any;
  endDate: any;
  cordID: string;
  acronym: string;
  kpiBaseName: string;
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

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.outliersChartId = 'outliersChart' + this.id.toString();
  }

  ngAfterViewInit(): void {
    this.outliersChartElement = document.getElementById(this.outliersChartId);
    this.sharedFunctions.hideElement(this.outliersChartElement);

    this.outliersChartLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.outliersParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.outliersParams.value.endDate);
    this.cordID = this.outliersParams.value.cordID;
    this.acronym = this.outliersParams.value.acronym;
    this.kpiBaseName = this.outliersParams.value.kpiBaseName;

    const url = this.sharedFunctions.generateURL(this.outliersParams, 'outliers');
    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;

        this.outlierData = response.data.values;
        this.outlierValues = response.data.outlier_values;
        this.outlierDates = response.data.dates;

        const generatedDates = this.sharedFunctions.generateDates(this.startDate, this.endDate, this.outlierDates);
        this.labels = generatedDates[0];
        this.outlierDatesFormatted = generatedDates[1];
        this.fillGaps();
        this.generateChart();
        this.outliersChartLoaded = true;
      } else {
        this.sharedFunctions.openSnackBar('Error ' + response.status + ': ' + response.data.error, 'OK');
      }
      this.outliersChartLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.sharedFunctions.openSnackBar('Error: ' + 'backend error', 'OK');
    });
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
  }

  removeComponent() {
    console.log('component removed: ' + this.id);
    this.removeId.emit(this.id);
  }

  generateChart() {
    this.outliersChart = new Chart(this.outliersChartElement, {
      type: 'line',
      data: {
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
      },
      options: {
        responsive: false,
        spanGaps: false,
        elements: {
          line: {
            skipNull: true,
            drawNull: false,
          }
        }
      }
    });
    this.sharedFunctions.showElement(this.outliersChartElement);
  }
}
