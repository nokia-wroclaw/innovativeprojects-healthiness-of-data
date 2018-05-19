import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CacheDataService} from '../../shared/services/cache.data.service';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {ExamplesService} from '../../shared/services/examples.service';
import {Observable} from 'rxjs/Observable';
import {OutliersDisplayComponent} from '../outliers/outliers-display/outliers-display.component';
import {Map2DDisplayComponent} from './map2d-display/map2d-display.component';
import {MatDatepickerInputEvent} from '@angular/material';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';

@Component({
  selector: 'app-map2d',
  templateUrl: './map2d.component.html',
  styleUrls: ['./map2d.component.css']
})
export class Map2dComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  filteredKpiBasenames: Observable<string[]>;
  filteredCordID1s: Observable<string[]>;
  filteredCordID2s: Observable<string[]>;

  map2DParams: FormGroup;
  cordID1FormControl = new FormControl('', [Validators.required]);
  cordID2FormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  map2DDisplayComponent = Map2DDisplayComponent;

  constructor(private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheDataService: CacheDataService,
              public examplesService: ExamplesService,
              private routerCommunicationService: RouterCommunicationService) {
    this.fullKpiBasenamesList = this.cacheDataService.getKpiBasenamesList();
    this.fullCordIDsList = this.cacheDataService.getFullCordIDsList();
  }

  ngOnInit() {
    this.initForm();
    this.filteredKpiBasenames = this.sharedFunctions.setOnChange(this.fullKpiBasenamesList, this.kpiBasenameFormControl);
    this.filteredCordID1s = this.sharedFunctions.setOnChange(this.fullCordIDsList, this.cordID1FormControl);
    this.filteredCordID2s = this.sharedFunctions.setOnChange(this.fullCordIDsList, this.cordID2FormControl);

  }

  initForm() {
    this.map2DParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID1: this.cordID1FormControl,
      cordID2: this.cordID1FormControl,
      kpiBaseName: this.kpiBasenameFormControl,
    });
  }

  get2DMap(map2DParams: FormGroup, componentClass: Type<any>) {
    const paramsAndComponentclass = {
      params: map2DParams,
      componentClass: componentClass
    };
    this.routerCommunicationService.emitChange(paramsAndComponentclass);
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }


}
