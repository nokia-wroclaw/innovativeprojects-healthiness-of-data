import {Component, OnInit} from '@angular/core';
import {RestService} from '../../shared/services/rest.service';

@Component({
  selector: 'app-decomposition',
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.css']
})
export class DecompositionComponent implements OnInit {

  object: any;

  constructor(private restService: RestService) {
  }

  ngOnInit() {

    // this.restService.getAll()
  }

}
