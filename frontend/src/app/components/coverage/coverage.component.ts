import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatDatepickerInputEvent} from '@angular/material';

import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {SharedFunctionsService} from '../../shared/services/shared.functions.service';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {Observable} from 'rxjs/Observable';
import {CacheDataService} from '../../shared/services/cache.data.service';
import {CoverageDisplayComponent} from './coverage-display/coverage-display.component';

@Component({
  moduleId: module.id,
  selector: 'app-coverage',
  templateUrl: './coverage.component.html',
  styleUrls: ['./coverage.component.css']
})
export class CoverageComponent implements OnInit {


  fullKpiBasenamesList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];
  acronymsByCordID: any = [];
  filteredCordIDs: Observable<string[]>;
  filteredAcronyms: Observable<string[]>;
  filteredKpiBasenames: Observable<string[]>;
  selectedAcronyms: any = [];
  selectedKpiBasenames: any = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];
  selectable = true;
  removable = true;
  addOnBlur = true;
  @ViewChild('chipInputAcronym', {read: MatAutocompleteTrigger})
  private autoCompleteTrigger: MatAutocompleteTrigger;

  coverageParams: FormGroup;
  cordIDFormControl = new FormControl('', [Validators.required]);
  kpiBasenamesFormControl = new FormControl('', [Validators.required]);
  acronymsFormControl: FormControl = new FormControl('', [Validators.required]);

  minStartDate = new Date(2014, 0);
  maxStartDate = new Date();
  minEndDate = new Date(2014, 0);
  maxEndDate = new Date();

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  coverageDisplayComponent = CoverageDisplayComponent;
  coverageComponents = [];

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private cacheDataService: CacheDataService,
              private sharedFunctions: SharedFunctionsService,
              private componentFactoryResolver: ComponentFactoryResolver) {
    this.fullKpiBasenamesList = this.cacheDataService.getKpiBasenamesList();
    this.fullCordIDsList = this.cacheDataService.getFullCordIDsList();
    this.fullCordIDsAcronymsSet = this.cacheDataService.getFullCordIDsAcronymsSet();
  }

  ngOnInit() {
    this.initForm();
    this.filteredCordIDs = this.sharedFunctions.setOnChange(this.fullCordIDsList, this.cordIDFormControl);
    this.filteredKpiBasenames = this.fullKpiBasenamesList.slice(0, 50);
    this.kpiBasenamesFormControl.valueChanges.subscribe((val) => {
      this.filterOptionsKpiBasename(val);
    });
    this.filteredAcronyms = this.acronymsByCordID.slice(0, 50);
    this.acronymsFormControl.valueChanges.subscribe(val => {
      this.filterOptionsAcronym(val);
    });
  }

  initForm() {
    this.coverageParams = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      cordID: this.cordIDFormControl,
      acronyms: [this.selectedAcronyms],
      kpiBaseNames: [this.selectedKpiBasenames],
      gapSize: [1, Validators.min(1)]
    });
  }

  public getCoverage(coverageParams: FormGroup, componentClass: Type<any>): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory, 0);
    component.instance.removeId.subscribe(
      (event: any) => {
        this.removeSpecificChild(this.coverageDisplayComponent, event);
      }
    );
    component.instance.id = this.id;
    const coveragePackage = {
      coverageParams: this.coverageParams,
      acronyms: this.selectedAcronyms,
      kpiBaseNames: this.selectedKpiBasenames
    };
    component.instance.coveragePackage = coveragePackage;
    this.coverageComponents[this.id] = component;
    this.id++;
  }

  removeSpecificChild(dynamicChildClass: Type<any>, id: number) {
    const component = this.coverageComponents[id];
    const componentIndex = this.coverageComponents.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
    }
  }

  // kpi basenames
  addChipKpiBasename(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedKpiBasenames.push(selection);
    this.fullKpiBasenamesList = this.fullKpiBasenamesList.filter(obj => obj !== selection);
    this.filteredKpiBasenames = this.fullKpiBasenamesList.slice(0, 50);
    if (input) {
      input.value = '';
    }
  }

  removeChipKpiBasename(chip: any): void {
    const index = this.selectedKpiBasenames.indexOf(chip);
    if (index >= 0) {
      this.selectedKpiBasenames.splice(index, 1);
      this.fullKpiBasenamesList.push(chip);
    }
  }

  filterOptionsKpiBasename(opt: string) {
    this.filteredKpiBasenames = this.fullKpiBasenamesList
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0).slice(0, 50);
  }

  // acronyms
  addChipAcronym(event: MatAutocompleteSelectedEvent, input: any): void {
    const selection = event.option.value;
    this.selectedAcronyms.push(selection);
    this.acronymsByCordID = this.acronymsByCordID.filter(obj => obj !== selection);
    this.filteredAcronyms = this.acronymsByCordID;
    if (input) {
      input.value = '';
    }
  }

  // force add chip
  // add(event: MatChipInputEvent): void {
  //   let input = event.input;
  //   let value = event.value;
  //   if ((value || '').trim()) {
  //     this.selectedAcronyms.push(value);
  //   }
  //   if (input) {
  //     input.value = '';
  //   }
  // }

  removeChipAcronym(chip: any): void {
    const index = this.selectedAcronyms.indexOf(chip);
    if (index >= 0) {
      this.selectedAcronyms.splice(index, 1);
      this.acronymsByCordID.push(chip);
    }
  }

  filterOptionsAcronym(opt: string) {
    this.filteredAcronyms = this.acronymsByCordID
      .filter(obj => obj.toLowerCase().indexOf(opt.toString().toLowerCase()) === 0);
  }

  filterAcronyms($event: MatAutocompleteSelectedEvent, inputCord: any) {
    this.acronymsByCordID.length = 0;
    this.selectedAcronyms.length = 0;
    this.acronymsByCordID = this.fullCordIDsAcronymsSet[inputCord.value];
  }

  inputFocus() {
    if (this.selectedAcronyms.length === 0) {
      this.filterOptionsAcronym('');
    }
  }

  setMinEndDate(event: MatDatepickerInputEvent<Date>) {
    this.minEndDate = event.value;
  }

  imLazy() {
    this.coverageParams.patchValue({
      startDate: new Date('2016-09-01T00:00:00.000Z'),
      endDate: new Date('2018-03-01T00:00:00.000Z'),
      cordID: 'Mr. Mime',
    });
    this.selectedAcronyms = ['threarirzearr', 'toubrishik', 'threghix'];
    this.selectedKpiBasenames = ['TRF_215', 'RNC_31'];
  }
}
