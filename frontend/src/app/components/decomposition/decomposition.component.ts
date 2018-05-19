import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import {MatDatepickerInputEvent} from '@angular/material';
import {ExamplesService} from '../../shared/services/examples.service';
import {CacheDataService} from '../../shared/services/cache.data.service';
import {DecompositionDisplayComponent} from './decomposition-display/decomposition-display.component';

@Component({
  selector: 'app-decomposition',
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.css']
})
export class DecompositionComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];
  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;

  decompositionParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  acronymFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  decompositionDisplayComponent = DecompositionDisplayComponent;
  decompositionComponents = [];

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
    // this.filteredAcronyms = this.setOnChange(this.acronymsByCordID, this.acronymFormControl);
    this.filteredAcronyms = this.acronymFormControl.valueChanges.pipe(startWith(''), map(val => this.sharedFunctions.filter(val, this.acronymsByCordID, 50)));
    this.cordIDFormControl.valueChanges.subscribe((cord) => {
      this.acronymsByCordID = this.fullCordIDsAcronymsSet[cord];
    });
  }

  initForm() {
    this.decompositionParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronym: this.acronymFormControl,
      kpiBaseName: this.kpiBasenameFormControl,
      frequency: 31
    });
  }

  getDecomposition(decompositionParams: FormGroup, componentClass: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory, 0);
    component.instance.removeId.subscribe(
      (event: any) => {
        this.removeSpecificChild(this.decompositionDisplayComponent, event);
      }
    );
    component.instance.id = this.id;
    component.instance.decompositionParams = decompositionParams;
    this.decompositionComponents[this.id] = component;
    this.id++;
  }

  removeSpecificChild(dynamicChildClass: Type<any>, id: number) {
    const component = this.decompositionComponents[id];
    const componentIndex = this.decompositionComponents.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
    }
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }

  inputFocus() {
    if (this.acronymFormControl.value === '') {
      this.decompositionParams.patchValue({acronym: ''});
    }
  }
}

