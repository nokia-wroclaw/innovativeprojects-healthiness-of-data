import {Component, DoCheck, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {MatAutocompleteTrigger} from '@angular/material';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';
import {CacheDataComponent} from '../../../shared/components/cache-data/cache-data.component';
import {RestService} from '../../../shared/services/rest.service';

@Component({
  selector: 'app-coverage-display',
  templateUrl: './coverage-display.component.html',
  styleUrls: ['./coverage-display.component.css']
})
export class CoverageDisplayComponent implements OnInit, OnChanges {


  @Input() coverageParams: FormGroup;
  @Input() formSubmitted = false;
  @Input() selectedAcronyms;
  @Input() selectedKpiBasenames;


  acronyms: any = [];
  kpiBaseNames: any = [];
  coverageData: any = [];

  startDate: string;
  endDate: string;
  cordID: any;
  fetchedIn: any;

  coverageTableLoaded = false;
  coverageTableLoading = false;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService) {
    console.log('constructor');
    console.log(this.kpiBaseNames.length);
    console.log(this.acronyms.length);
  }

  ngOnInit() {
    console.log('on init');
    console.log(this.kpiBaseNames.length);
    console.log(this.acronyms.length);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('on changes: ' + this.formSubmitted);
    console.log(this.selectedKpiBasenames);
    console.log(this.selectedAcronyms);
    console.log(this.kpiBaseNames.length);
    console.log(this.acronyms.length);
    if (this.formSubmitted) {


      this.coverageTableLoading = true;
      this.startDate = this.sharedFunctions.parseDate(this.coverageParams.value.startDate);
      this.endDate = this.sharedFunctions.parseDate(this.coverageParams.value.endDate);
      this.cordID = this.coverageParams.value.cordID;
      const baseURL = 'api/coverage/' + this.cordID + '?date_start=' + this.startDate + '&date_end=' + this.endDate;
      this.selectedKpiBasenames = this.selectedKpiBasenames.map((e) => {
        return e.toUpperCase();
      });
      const kpiBaseNamesURL = this.sharedFunctions.processArguments(this.selectedKpiBasenames, 'kpi_basename');
      const acronymsURL = this.sharedFunctions.processArguments(this.selectedAcronyms, 'acronym');

      const url = baseURL + kpiBaseNamesURL + acronymsURL + '&gap_size=' + this.coverageParams.value.gapSize;
      let start = new Date().getTime();
      this.restService.getAll(url).then(response => {
        if (response['status'] === 200) {
          console.log('coverageData: ');
          console.log(response.data);
          if (response.data.error) {
            this.sharedFunctions.openSnackBar(response.data.error, 'OK');
            this.coverageTableLoading = false;
          } else {
            let end = new Date().getTime();
            this.fetchedIn = end - start;
            this.acronyms = this.selectedAcronyms;
            this.kpiBaseNames = this.selectedKpiBasenames;
            this.coverageTableLoading = false;
            this.coverageData = response.data;
            this.coverageTableLoaded = true;
          }
        } else {
          this.sharedFunctions.openSnackBar('Error: ' + response['status'], 'OK');
          this.coverageTableLoading = false;
        }
      });
    }
  }
}
