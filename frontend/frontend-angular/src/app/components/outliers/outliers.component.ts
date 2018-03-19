import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RestService } from '../../services/rest.service';

declare var Chart: any;

@Component({
	selector: 'app-outliers',
	templateUrl: './outliers.component.html',
	styleUrls: ['./outliers.component.css']
})
export class OutliersComponent implements OnInit {

	outlierParams: FormGroup;
	data: any = [1, 2, 3, 4, 1, 1, 1, 2, 3, 1, 4, 5, 3, 1, 2, 3, 4, 1, 1, 1, 2, 3, 1, 4, 5, 3, 1, 2, 3, 4];
	labels: any = [];

	startDate: any;
	endDate: any;
	outliersChartLoading: boolean = false;
	fullData: any = [];
	fullOutlierData: any = [];
	private kpiBaseNames: string[];
	private acronyms: string[];
	private cordIds: string[];
	private outliersData: any = [];
	private outliersChartLoaded: boolean = false;
	numericLabels: any = [];
	colors: any = [];
	outliersIndexes: any = [];
	outliersValues: any = [];
	colorsString: string = '';
	myChart: any;

	constructor(private router: Router,
				private restService: RestService,
				private formBuilder: FormBuilder) {

	}

	ngOnInit() {
		this.initForm();

	}

	getOutliers(outliersParams) {
		this.outliersChartLoading = true;
		this.startDate = outliersParams.value.startDate;
		this.endDate = outliersParams.value.endDate;
		this.kpiBaseNames = outliersParams.value.kpiBaseNames.split(/[\s,]+/);
		this.acronyms = outliersParams.value.acronyms.split(/[\s,]+/);
		this.cordIds = outliersParams.value.cordIds.split(/[\s,]+/);

		let baseURL = 'api/operators/outliers/' + this.cordIds + '?date_start=' + this.startDate + '&date_end=' + this.endDate;


		let kpiBaseNamesURL = '';
		let acronymsURL = '';
		let cordIdsURL = '';

		this.kpiBaseNames.forEach((kpi) => {
			if (kpi !== '') {
				kpiBaseNamesURL += '&kpi_basename=' + kpi;
			}
		});
		this.acronyms.forEach((acr) => {
			if (acr !== '') {
				acronymsURL += '&acronym=' + acr;
			}
		});

		this.cordIds.forEach((cor) => {
			if (cor !== '') {
				cordIdsURL += '&cord_id=' + cor;
			}
		});
		let url = baseURL + kpiBaseNamesURL + acronymsURL + cordIdsURL;
		console.log(url);
		this.restService.getAll(url).then(response => {
			console.log('outliersData: ');
			console.log(response.data);
			this.outliersChartLoading = false;
			this.outliersData = response.data.values;
			this.outliersValues = response.data.outlier_values;
			this.outliersIndexes = response.data.outliers;
			console.log(this.outliersIndexes);
			this.generateDates();

		}).then(() => {
			this.generateLabels();
			this.outliersChartLoaded = true;
			console.log(this.outliersData);
		})

	}

	initForm() {
		this.outlierParams = this.formBuilder.group({
			startDate: '',
			endDate: '',
			kpiBaseNames: '',
			acronyms: '',
			cordIds: ''
		});
	}

	generateChart() {
		console.log('generating chart...');
		let ctx = document.getElementById("myChart");

		this.myChart = new Chart(ctx, {
			type: 'scatter',
			data: {
				datasets: [{
          label: 'Outliers',
          data: this.fullOutlierData,
          backgroundColor: 'rgba(160, 0, 0, 1)',
          borderColor: 'rgba(160, 0, 0, 1)',
          borderWidth: 0.5,
          fill: false
        },{
					label: 'Normal Data',
					data: this.fullData,
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)',
					borderWidth: 0.5,
					fill: false
				}

				]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				}
			}
		});

	}

	generateDates() {
		let moment = require('moment');
		require('twix');
		let itr = moment.twix(new Date(this.startDate), new Date(this.endDate)).iterate("days");
		while (itr.hasNext()) {
			let fullDate = itr.next().toDate();
			let day = fullDate.getFullYear() + '-' + (fullDate.getMonth() + 1) + '-' + fullDate.getDate();
			this.labels.push(day);
		}
	}

	generateLabels() {
	  let x = 0;
	  for (let i = 0; i < this.outliersData.length; i++) {
	    if(i === this.outliersIndexes[x]){
	      this.fullOutlierData.push({x: i, y: this.outliersData[i]});
	      x += 1;
      } else {
        this.fullData.push({x: i, y: this.outliersData[i]});
      }
		}
    this.generateChart();

	}


}
