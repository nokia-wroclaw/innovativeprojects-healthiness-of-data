import axios from 'axios';
import { API_URL } from '../config';
import { Injectable } from '@angular/core';


@Injectable()
export class RestService {

	headers;

	constructor() {
		const token = sessionStorage.getItem('token');
		this.headers = { headers: { 'Token': token } };
	}

	setHeaders() {
		return {
			headers: { 'Token': sessionStorage.getItem('token') }
		};
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


