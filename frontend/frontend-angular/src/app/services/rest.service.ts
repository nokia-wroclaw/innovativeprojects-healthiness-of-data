import axios from 'axios';
import {API_URL} from '../config';
import {Injectable} from '@angular/core';


@Injectable()
export class RestService {

  constructor() {
  }

  getAll<T>(resouceName: String) {
    const url = `${API_URL}/${resouceName}`;
    return axios.get(url)
      .then(function (response) {
        return response;
      }).catch(function (error) {
        if (error.message === 'Network Error') {
          return error;
        }
        return error.response;
      });
  }
}


