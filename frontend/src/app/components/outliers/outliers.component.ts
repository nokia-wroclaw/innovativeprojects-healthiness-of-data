import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {RestService} from '../../shared/services/rest.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {MatDatepickerInputEvent} from '@angular/material';
import {ExamplesService} from '../../shared/services/examples.service';
import {OutliersDisplayComponent} from './outliers-display/outliers-display.component';
import {CacheDataService} from '../../shared/services/cache.data.service';

@Component({
  selector: 'app-outliers',
  templateUrl: './outliers.component.html',
  styleUrls: ['./outliers.component.css']
})
export class OutliersComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];

  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  outliersParams: FormGroup;

  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  outliersDisplayComponent = OutliersDisplayComponent;
  outlierComponents = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cacheDataService: CacheDataService,
              public examplesService: ExamplesService,
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
  }

  initForm() {
    this.outliersParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      threshold: '',
      windowSize: '',
    });
  }

  getOutliers(outliersParams: FormGroup, componentClass: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory, 0);
    component.instance.id = this.id;
    component.instance.outliersParams = outliersParams;
    this.outlierComponents.push(component);
    this.id++;
  }

  removeDynamicChild(dynamicChildClass: Type<any>) {
    const component = this.outlierComponents.find((comp) => comp.instance instanceof dynamicChildClass);
    const componentIndex = this.outlierComponents.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
      this.outlierComponents.splice(componentIndex, 1);
    }
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }
}



