import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {CacheDataComponent} from '../components/cache-data/cache-data.component';
import {RestService} from './rest.service';


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
}
