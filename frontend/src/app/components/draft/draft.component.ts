import {Component, OnInit} from '@angular/core';
import {CacheDataComponent} from '../../shared/components/cache-data/cache-data.component';


@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit {

  kpis: any = [];

  constructor(private cacheData: CacheDataComponent) {
    console.log('init');
    this.kpis = this.cacheData.getKpiBasenamesList();
    console.log(this.kpis);
  }

  ngOnInit() {
    // console.log('init');
    // this.kpis = this.cacheData.getKpiBasenamesList();
    // console.log(this.kpis);
  }

}

