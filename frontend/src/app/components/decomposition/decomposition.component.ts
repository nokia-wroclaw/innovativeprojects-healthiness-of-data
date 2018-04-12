import {Component, OnInit} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';

@Component({
  selector: 'app-decomposition',
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.css']
})
export class DecompositionComponent implements OnInit {

  observedDates: any;
  observedValues: any;
  seasonalDates: any;
  seasonalValues: any;
  trendDates: any;
  trendValues: any;

  decompositionParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheData: CacheDataComponent) {
  }

  ngOnInit() {
    this.initForm();

    this.restService.getAll('api/decomposition/Skuntank/dilfihess?date_start=2016-01-01&date_end=2017-01-01&kpi_basename=SGSN_2012&frequency=31').then((response) => {
      console.log(response.data.observed_dates);
      console.log(response.data.observed_values);

      console.log(response.data.seasonal_dates);
      console.log(response.data.seasonal_values);

      console.log(response.data.trend_dates);
      console.log(response.data.trend_values);
    });
  }

  initForm() {
    this.decompositionParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseNames: this.kpiBasenamesFormControl,
      frequency: ''
    });
  }

  getDecomposition(decompositionParams: FormGroup) {

  }
}
