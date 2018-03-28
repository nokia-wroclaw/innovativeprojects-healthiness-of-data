import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs/Subject';


declare var Chart: any;

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent implements OnInit {


  myChart: any;
  labels: any = [];

  constructor(private fb: FormBuilder) {
  }


  ngOnInit() {
    this.generateDates();
    this.generateChart();
  }


  generateChart() {
    console.log('generating chart...');
    let chart = document.getElementById('myChart');
    this.myChart = new Chart(chart, {
      type: 'line',
      data: {
        labels: this.labels,
        // labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        datasets: [{
          label: 'Outliers',
          data: [1, 2, 2.5, 1.7, 4.2, 6.9],
          backgroundColor: 'rgba(160, 0, 0, 1)',
          borderColor: 'rgba(160, 0, 0, 1)',
          borderWidth: 0.5,
          fill: false
        }, {
          label: 'Normal Data',
          data: [4, 2.64, null , 3.8],
          backgroundColor: 'rgba(0, 0, 160, 1)',
          borderColor: 'rgba(0, 0, 160, 1)',
          borderWidth: 0.5,
          fill: false
        }

        ]
      },
      options: {
        spanGaps: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              stacked: true
            }
          }]
        }
      }
    });

  }
  generateDates() {
    const moment = require('moment');
    require('twix');
    const itr = moment.twix(new Date('2018-01-01'), new Date('2018-01-14')).iterate('days');
    while (itr.hasNext()) {
      const fullDate = itr.next().toDate();
      const day = fullDate.getFullYear() + '-' + (fullDate.getMonth() + 1) + '-' + fullDate.getDate();
      this.labels.push(day);
    }
    console.log('dates: ' + this.labels.length);
    console.log(this.labels);
  }
}
