import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {FormControl, FormGroup} from '@angular/forms';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';


@Injectable()
export class SharedFunctionsService {


  constructor(public snackBar: MatSnackBar) {
  }

  parseDate(date: any): string {
    if (date._d !== undefined) {
      date = date._d;
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    } else {
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }
  }

  filter(value: string, list: any, sliceSize: number): string[] {
    return list.filter(option =>
      option.toLowerCase().indexOf(value.toLowerCase()) === 0).slice(0, sliceSize);
  }

  processArguments(argumentsList: string[], argumentName: string): string {
    let argURL = '';
    argumentsList.forEach((arg) => {
      if (arg !== '') {
        argURL += '&' + argumentName + '=' + arg;
      }
    });
    return argURL;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {});
  }

  switchOpenHideElement(element: any) {
    if (element.style.display === 'none') {
      element.style.display = 'block';
    } else {
      element.style.display = 'none';
    }
  }

  hideElement(element: any) {
    element.style.display = 'none';

  }

  showElement(element: any) {
    element.style.display = 'block';
  }

  setOnChange(full: any, formControl: FormControl): any {
    return formControl.valueChanges
      .pipe(startWith(''), map((val) => this.filter(val, full, 100)));
  }

  generateDates(startDate: string, endDate: string, dates: any) {
    const moment = require('moment');
    require('twix');
    const labels = [];
    const datesFormatted = [];
    const itr = moment.twix(new Date(startDate), new Date(endDate)).iterate('days');
    while (itr.hasNext()) {
      labels.push(this.parseDate(itr.next().toDate()));
    }

    for (let i = 0; i < dates.length; i++) {
      datesFormatted.push(this.parseDate(new Date(dates[i])));
    }

    return [labels, datesFormatted];
  }

  generateURL(params: any, component: string): string {
    let url = 'api/';
    let baseURL = '';
    if (component === 'coverage') {
      const startDate = this.parseDate(params.coverageParams.value.startDate);
      const endDate = this.parseDate(params.coverageParams.value.endDate);
      const cordID = params.coverageParams.value.cordID;
      // const kpiBaseName = params.coverageParams.value.kpiBaseName.toUpperCase();
      // const acronym = params.coverageParams.value.acronym;
      baseURL = cordID + '?date_start=' + startDate + '&date_end=' + endDate;
    } else {
      const startDate = this.parseDate(params.value.startDate);
      const endDate = this.parseDate(params.value.endDate);
      const cordID = params.value.cordID;
      const kpiBaseName = params.value.kpiBaseName.toUpperCase();
      const acronym = params.value.acronym;
      baseURL = cordID + '/' + acronym + '?date_start=' + startDate + '&date_end=' + endDate + '&kpi_basename=' + kpiBaseName;
    }

    switch (component) {
      case 'histogram': {
        url += 'clusters/aggregates/' + baseURL;
        if (!!params.value.histBins) {
          url += '&bins=' + params.value.histBins;
        }
        break;
      }
      case 'coverage': {

        break;
      }
      case 'decomposition': {
        url += 'decomposition/' + baseURL;
        if (!!params.value.frequency) {
          url += '&frequency=' + params.value.frequency;
        }
        break;
      }
      case 'outliers': {
        url += 'outliers/' + baseURL;
        if (!!params.value.threshold) {
          url += '&threshold=' + params.value.threshold;
        }
        if (!!params.value.windowSize) {
          url += '&window_size=' + params.value.windowSize;
        }
        break;
      }
      case 'map2D': {

        break;
      }
      default: {
        console.log('invalid component');
        break;
      }

    }
    return url;
  }

}
