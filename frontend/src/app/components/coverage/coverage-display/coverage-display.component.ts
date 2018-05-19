import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';
import {RestService} from '../../../shared/services/rest.service';

@Component({
  selector: 'app-coverage-display',
  templateUrl: './coverage-display.component.html',
  styleUrls: ['./coverage-display.component.css']
})
export class CoverageDisplayComponent implements OnInit, AfterViewInit {

  @Input() params: any;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<any>();

  coverageParams: FormGroup;

  fetchedIn: any;

  startDate: string;
  endDate: string;
  cordID: string;
  acronyms: any = [];
  kpiBaseNames: any = [];
  coverageData: any = [];
  coverageTableLoaded = false;
  coverageTableLoading = false;

  coverageDisplayComponent = CoverageDisplayComponent;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.coverageParams = this.params.coverageParams;
    this.acronyms = this.params.acronyms;
    this.kpiBaseNames = this.params.kpiBaseNames;
  }

  ngAfterViewInit(): void {
    this.coverageTableLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.coverageParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.coverageParams.value.endDate);
    this.cordID = this.coverageParams.value.cordID;

    const baseURL = 'api/coverage/' + this.cordID + '?date_start=' + this.startDate + '&date_end=' + this.endDate;

    this.kpiBaseNames = this.kpiBaseNames.map((e) => {
      return e.toUpperCase();
    });
    const kpiBaseNamesURL = this.sharedFunctions.processArguments(this.kpiBaseNames, 'kpi_basename');
    const acronymsURL = this.sharedFunctions.processArguments(this.acronyms, 'acronym');

    const url = baseURL + kpiBaseNamesURL + acronymsURL + '&gap_size=' + this.coverageParams.value.gapSize;
    const start = new Date().getTime();
    this.restService.getAll(url).then(response => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;
        this.coverageData = response.data;
        this.coverageTableLoaded = true;
      } else {
        this.sharedFunctions.openSnackBar('Error ' + response.status + ': ' + response.data.error, 'OK');
      }
      this.coverageTableLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.sharedFunctions.openSnackBar('Error: ' + 'backend error', 'OK');
    });
  }

  removeComponent() {
    console.log('component removed: ' + this.id);
    const toRemove = {
      removeId: this.id,
      typeOfComponent: this.coverageDisplayComponent
    };
    this.removeId.emit(toRemove);
  }
}
