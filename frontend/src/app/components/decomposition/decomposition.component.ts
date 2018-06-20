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
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';

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

  decompositionDisplayComponent = DecompositionDisplayComponent;

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
      const paramsAndComponentclass = {
      params: decompositionParams,
      componentClass: componentClass
    };
    this.routerCommunicationService.emitChange(paramsAndComponentclass);
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

