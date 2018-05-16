import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {MatDatepickerInputEvent} from '@angular/material';
import {ExamplesService} from '../../shared/services/examples.service';
import {CacheDataService} from '../../shared/services/cache.data.service';
import {OutliersDisplayComponent} from '../outliers/outliers-display/outliers-display.component';
import {AggregatesHistogramDisplayComponent} from './aggregates-histogram-display/aggregates-histogram-display.component';


@Component({
  selector: 'app-aggregates-histogram',
  templateUrl: './aggregates-histogram.component.html',
  styleUrls: ['./aggregates-histogram.component.css']
})
export class AggregatesHistogramComponent implements OnInit {

  histogramParamsReady: FormGroup;
  formSubmitted = false;

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  histogramParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);
  histBinsFormControl = new FormControl('',);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  histogramDisplayComponent = AggregatesHistogramDisplayComponent;
  histogramComponents = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheDataService: CacheDataService,
              private examplesService: ExamplesService,
              private componentFactoryResolver: ComponentFactoryResolver) {
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

    this.histogramParams.valueChanges.subscribe(() => {
      this.formSubmitted = false;
    });
  }

  initForm() {
    this.histogramParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      histBins: this.histBinsFormControl
    });
  }

  getHistogram(histogramParams, componentClass: Type<any>) {
    console.log('coverage params');
    console.log(this.histogramParams);
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory, 0);
    component.instance.id = this.id;
    component.instance.histogramParams = histogramParams;
    this.histogramComponents.push(component);
    this.id++;
  }

  removeDynamicChild(dynamicChildClass: Type<any>) {
    const component = this.histogramComponents.find((comp) => comp.instance instanceof dynamicChildClass);
    const componentIndex = this.histogramComponents.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
      this.histogramComponents.splice(componentIndex, 1);
    }
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }
}
