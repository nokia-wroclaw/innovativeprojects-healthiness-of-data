import {Component, OnInit, Type} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CacheDataService} from '../../shared/services/cache.data.service';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {ExamplesService} from '../../shared/services/examples.service';
import {Observable} from 'rxjs/Observable';
import {Map2DDisplayComponent} from './map2d-display/map2d-display.component';
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from '@angular/material';
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-map2d',
  templateUrl: './map2d.component.html',
  styleUrls: ['./map2d.component.css']
})
export class Map2dComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  filteredKpiBasenames: Observable<string[]>;
  filteredCordIDs: Observable<string[]>;
  selectedCordIDs: any = [];

  map2DParams: FormGroup;
  cordIDsFormControl = new FormControl('', [Validators.required]);
  kpiBasenameFormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  separatorKeysCodes = [ENTER, COMMA, TAB];
  selectable = true;
  removable = true;
  addOnBlur = true;

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
    this.filteredCordIDs = this.fullCordIDsList;
    this.cordIDsFormControl.valueChanges.subscribe(val => {
      this.filterOptionsCordIDs(val);
    });

  }

  initForm() {
    this.map2DParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordIDs: '',
      kpiBaseName: this.kpiBasenameFormControl,
      otherDate: ''
    });
  }

  get2DMap(map2DParams: FormGroup, componentClass: Type<any>) {
    const map2DPackage = {
      map2DParams: map2DParams,
      cordIDs: this.selectedCordIDs
    };
    const paramsAndComponentclass = {
      params: map2DPackage,
      componentClass: componentClass
    };
    this.routerCommunicationService.emitChange(paramsAndComponentclass);
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }

  // cord IDs
  addChipCordID(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedCordIDs.push(selection);
    this.fullCordIDsList = this.fullCordIDsList.filter(obj => obj !== selection);
    this.filteredCordIDs = this.fullCordIDsList.slice(0, 50);
    if (input) {
      input.value = '';
    }
  }

  removeChipCordId(chip: any): void {
    const index = this.selectedCordIDs.indexOf(chip);
    if (index >= 0) {
      this.selectedCordIDs.splice(index, 1);
      this.fullCordIDsList.push(chip);
    }
  }

  filterOptionsCordIDs(opt: string) {
    this.filteredCordIDs = this.fullCordIDsList
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0).slice(0, 50);
  }

  exampleCase(example: any) {
    this.map2DParams.patchValue(example);
    this.selectedCordIDs = example.chips;
  }

}
