import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestService } from '../services/rest.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-coverage',
	templateUrl: './coverage.component.html',
	styleUrls: ['./coverage.component.css']
})
export class CoverageComponent implements OnInit {

	example: any;
	coverageParams: FormGroup;
	coverageData: any = [];

	cordId: any;
	coverage: any;

	constructor(private router: Router,
				private restService: RestService,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.initForm();
		this.getExamples();
	}


	public getCoverage(coverageParams): void{
		console.log('test parametrów z formularza:');
		console.log(coverageParams.value.kpiBasename);
		console.log(coverageParams.value.startDate);
		console.log(coverageParams.value.endDate);
		console.log(coverageParams.value.acronym);

		let startDate: string = coverageParams.value.startDate;
		let endDate: string = coverageParams.value.endDate;
		let kpiBasename: string = coverageParams.value.kpiBasename;
		let acronym: string = coverageParams.value.acronym;

		let url = 'api/clusters/coverage/?date_start=' + startDate + '&date_end=' + endDate + '&kpi_basename=' + kpiBasename + '&acronym=' + acronym;
		let u = 'api/clusters/coverage/?date_start=2016-01-01&date_end=2018-12-01&kpi_basename=LTE_5644&acronym=serzhus';
		console.log(url);
		this.restService.getAll(url).then(response => {
			console.log('coverageData: ' + this.coverageData.length);
			this.coverageData = response.data;
			console.log(response);
			this.coverage = response.data[0].coverage;
			this.cordId = response.data[0].cord_id;

		})

	}

	initForm() {
		this.coverageParams = this.formBuilder.group({
			kpiBasename: '',
			startDate: '',
			endDate: '',
			acronym: ''
		});
	}

	getExamples() {
		let mock_data = require('../mock-data/example.json');
		console.log('json');
		console.log(mock_data);
		this.example = mock_data;
	}


}
