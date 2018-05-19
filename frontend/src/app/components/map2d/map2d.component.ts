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
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];
  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  map2DParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
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
    this.fullCordIDsAcronymsSet = this.cacheDataService.getFullCordIDsAcronymsSet();
  }

  ngOnInit() {
    this.initForm();
    this.filteredKpiBasenames = this.sharedFunctions.setOnChange(this.fullKpiBasenamesList, this.kpiBasenameFormControl);
    this.filteredCordIDs = this.sharedFunctions.setOnChange(this.fullCordIDsList, this.cordIDFormControl);
    // this.filteredAcronyms = this.sharedFunctions.setOnChange(this.acronymsByCordID, this.acronymFormControl);
    this.filteredAcronyms = this.acronymFormControl.valueChanges.pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.acronymsByCordID, 50)));
    this.cordIDFormControl.valueChanges.subscribe((cord) => {
      this.acronymsByCordID = this.fullCordIDsAcronymsSet[cord];
    });
  }

  initForm() {
    this.map2DParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl
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
