import {Component, OnInit} from '@angular/core';
import {CacheDataComponent} from './shared/components/cache-data/cache-data.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }

  constructor(private cacheData: CacheDataComponent) {
    this.cacheData.setKpiBasenamesList();
  }

}
