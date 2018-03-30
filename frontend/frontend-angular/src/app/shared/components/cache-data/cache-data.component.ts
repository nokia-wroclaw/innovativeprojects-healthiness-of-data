import {Component, OnInit} from '@angular/core';
import {RestService} from '../../services/rest.service';

@Component({
  selector: 'app-cache-data',
  templateUrl: './cache-data.component.html',
  styleUrls: ['./cache-data.component.css']
})
export class CacheDataComponent implements OnInit {

  constructor(private restService: RestService) {
  }

  ngOnInit() {
  }

  setKpiBasenamesList(): any {
    this.restService.getAll('api/clusters/kpi_basenames').then(kpiFull => {
      localStorage.setItem('kpiBasenamesFullList', kpiFull.data);
      console.log('downloaded kpi basenems list');
      return kpiFull;
    }).catch((error) => {
      console.log(error);
    });
  }

  getKpiBasenamesList() {
    console.log('local');

    let kpiFull = localStorage.getItem('kpiBasenamesFullList');
    console.log(kpiFull);
    if (kpiFull != null) {
      return kpiFull;
    } else {
      kpiFull = this.setKpiBasenamesList();
    }
    return kpiFull;
  }


}
