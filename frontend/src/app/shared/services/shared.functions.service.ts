import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {FormControl} from '@angular/forms';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';


@Injectable()
export class SharedFunctionsService {


  constructor(public snackBar: MatSnackBar) {
  }

  parseDate(date: any): string {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
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
    let labels = [];
    let datesFormatted = [];
    const itr = moment.twix(new Date(startDate), new Date(endDate)).iterate('days');
    while (itr.hasNext()) {
      labels.push(this.parseDate(itr.next().toDate()));
    }

    for (let i = 0; i < dates.length; i++) {
      datesFormatted.push(this.parseDate(new Date(dates[i])));
    }

    return [labels, datesFormatted];
  }

}
