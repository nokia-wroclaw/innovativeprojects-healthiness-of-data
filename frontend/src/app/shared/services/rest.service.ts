import axios from 'axios';
import {API_URL} from '../../config';
import {Injectable} from '@angular/core';


@Injectable()
export class RestService {

  constructor() {
  }

  getAll<T>(resourceName: String) {
    const url = `${API_URL}/${resourceName}`;
    return axios.get(url)
      .then(function (response) {
        return response;
      }).catch((error) => {
        if (error.message === 'Network Error') {
          return error;
        }
        return error.response;
      });
  }
}


