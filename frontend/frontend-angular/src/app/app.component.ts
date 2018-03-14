import {Component, OnInit} from '@angular/core';
import {RestService} from './services/rest.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'app';
  example: any;

  constructor(private restService: RestService) {
  }

  ngOnInit(): void {
    this.getExamples();
  }

  getExamples() {
    let mock_data = require('./mock-data/example.json');
    console.log('json');
    console.log(mock_data);
    this.example = mock_data;
    // this.restService.getAll('./mock-data/example.json')
    //   .then((examples) => {
    //     this.example = examples;
    //     console.log('example');
    //     console.log(this.example);
    //   });
  }
}
