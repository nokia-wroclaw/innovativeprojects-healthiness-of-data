import {Component, OnInit} from '@angular/core';
import {RestService} from '../../services/rest.service';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';

@Component({
  selector: 'app-cache-data',
  templateUrl: './cache-data.component.html',
  styleUrls: ['./cache-data.component.css']
})
export class CacheDataComponent implements OnInit {

  fullKpiBasenamesList: any = [];
  fullAcronymsList: any = [];
  fullCordIDsList: any = [];
  fullCordIDsAcronymsSet: any = [];

  constructor(private restService: RestService) {
  }

  ngOnInit() {
  }

  // kpi basenames
  setFullKpiBasenamesList(): any {
    return this.restService.getAll('api/fetch_kpi_basenames').then((response) => {
      this.fullKpiBasenamesList = response.data;
      localStorage.setItem('fullKpiBasenamesList', response.data);
      console.log('downloaded kpi basenames list');
    }).catch((error) => {
      console.log(error);
    });
  }

  getKpiBasenamesList(): any {
    const item = localStorage.getItem('fullKpiBasenamesList');
    if (item != null || item.substring(0, 9) !== '<!DOCTYPE') {
      return item.split(',');
    } else {
      this.setFullKpiBasenamesList().then((r) => {
        return r.split(',');
      });
    }
  }

  // cord ids
  setFullCordIDsList(): any {
    return this.restService.getAll('api/fetch_cord_ids').then((response) => {
      this.fullCordIDsList = response.data;
      localStorage.setItem('fullCordIDsList', response.data);
      console.log('downloaded cord IDs list');
    }).catch((error) => {
      console.log(error);
    });
  }

  getFullCordIDsList(): any {
    const item = localStorage.getItem('fullCordIDsList');
    if (item != null || item.substring(0, 9) !== '<!DOCTYPE') {
      return item.split(',');
    } else {
      this.setFullCordIDsList().then((r) => {
        return r.split(',');
      });
    }
  }

  // cord-acronyms set
  setFullCordIDsAcronymsSet(): any {
    return this.restService.getAll('api/fetch_cord_acronym_set').then((response) => {
      this.fullCordIDsAcronymsSet = response.data;
      localStorage.setItem('fullCordIDsAcronymsSet', JSON.stringify(this.fullCordIDsAcronymsSet));
      console.log('downloaded cord-acronyms set list');
    }).catch((error) => {
      console.log(error);
    });
  }

  getFullCordIDsAcronymsSet(): any {
    const item = localStorage.getItem('fullCordIDsAcronymsSet');
    if (item != null || item.substring(0, 9) === '<!DOCTYPE') {
      return JSON.parse(item);
    } else {
      this.setFullCordIDsAcronymsSet().then((r) => {
        return r;
      });
    }
  }

  clearLocalStorage() {
    localStorage.removeItem('fullKpiBasenamesList');
    localStorage.removeItem('fullCordIDsList');
    localStorage.removeItem('fullCordIDsAcronymsSet');
  }

}

