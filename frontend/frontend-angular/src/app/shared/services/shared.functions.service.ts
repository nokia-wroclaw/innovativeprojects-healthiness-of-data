import {Injectable} from '@angular/core';


@Injectable()
export class SharedFunctionsService {


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
}
