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

	coverageParams: FormGroup;
	coverageData: any = [];

	kpiBaseNames: any = [];
	acronyms: any = [];
	startDate: string;
	endDate: string;
	coverageTableLoaded: boolean = false;
	coverageTableLoading: boolean = false;

	constructor(private router: Router,
				private restService: RestService,
				private formBuilder: FormBuilder) {
	}

	ngOnInit() {
		this.initForm();
	}

	public getCoverage(coverageParams): void {

		this.coverageTableLoading = true;
		this.startDate = coverageParams.value.startDate;
		this.endDate = coverageParams.value.endDate;
		let baseURL = 'api/clusters/coverage/?date_start=' + this.startDate + '&date_end=' + this.endDate;

		this.kpiBaseNames = coverageParams.value.kpiBaseNames.split(/[\s,]+/);
		this.acronyms = coverageParams.value.acronyms.split(/[\s,]+/);

		let kpiBaseNamesURL = '';
		let acronymsURL = '';

		this.kpiBaseNames.forEach((kpi) => {
			kpiBaseNamesURL += '&kpi_basename=';
			kpiBaseNamesURL += kpi;
		});
		this.acronyms.forEach((acr) => {
			acronymsURL += '&acronym=';
			acronymsURL += acr;
		});

		let url = baseURL + kpiBaseNamesURL;
		url += acronymsURL;

		this.restService.getAll(url).then(response => {
			console.log('coverageData: ');
			console.log(response.data);
			this.coverageTableLoading = false;
			this.coverageData = response.data;
			this.coverageTableLoaded = true;
		})

	}

	initForm() {
		this.coverageParams = this.formBuilder.group({
			startDate: '',
			endDate: '',
			kpiBaseNames: '',
			acronyms: ''
		});
	}

}
