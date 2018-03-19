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
	private kpiBaseNames: string[];
	private acronyms: string[];
	private cordIds: string[];
	private outliersData: any = [];
	private outliersChartLoaded: boolean = false;
	numericLabels: any = [];
	colors: any = [];
	outliersIndexes: any = [];
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
			type: 'line',
			data: {
				labels: this.numericLabels,
				datasets: [{
					label: 'Outliers chart',
					data: this.outliersData,
					backgroundColor:
						'rgba(0, 0, 255, 1)',
					borderColor: [
						'rgba(0, 0, 255, 1)'
					],
					borderWidth: 0.5,
					fill: true
				}]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: false
						}
					}]
				}, showLines: false
			}
		});
		this.myChart.config.data.datasets[0].backgroundColor = this.colors;
		console.log("chart generated!");


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
		for (let i = 1; i <= this.outliersData.length; i++) {
			this.numericLabels.push(i);
			this.colors.push('rgba(37, 165, 0, 1)');
		}
		console.log(this.numericLabels);
		console.log('colors before marking');
		console.log(this.colors);
		this.markOutliers();

	}

	markOutliers() {
		for (let i = 0; i < this.outliersIndexes.length; i++) {
			this.colors[this.outliersIndexes[i]] = 'rgba(215, 0, 0, 1)';
		}
		console.log('colors after marking');
		console.log(this.colors);

		this.generateChart();
	}

	changeColor() {

	}

}
