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

		let kpiBasename: string = coverageParams.value.kpiBasename;
		let startDate: string = coverageParams.value.kpiBasename;
		let endDate: string = coverageParams.value.kpiBasename;

		let url = kpiBasename + '/' + startDate + '/' + endDate;
		this.restService.getAll(url).then(response => {
			console.log('coverageData: ' + this.coverageData.length);

			this.coverageData = response.data;
			console.log(this.coverageData);

		})

	}

	initForm() {
		this.coverageParams = this.formBuilder.group({
			kpiBasename: '',
			startDate: '',
			endDate: ''
		});
	}

	getExamples() {
		let mock_data = require('../mock-data/example.json');
		console.log('json');
		console.log(mock_data);
		this.example = mock_data;
	}


}
