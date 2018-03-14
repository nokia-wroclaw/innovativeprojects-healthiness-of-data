import {Component, OnInit} from '@angular/core';
import {RestService} from '../services/rest.service';


@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {

  example: any;

  constructor(private restService: RestService) {
  }

  ngOnInit() {
    this.getExamples();
  }

  getExamples() {
    this.restService.getAll('tu ma byc url z backendu')
      .then((examples) => {
      this.example = examples.data;
      console.log(this.example);
    });
  }

}
