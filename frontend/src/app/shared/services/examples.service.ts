import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Injectable()
export class ExamplesService {

  public EXAMPLES = [{
    startDate: new Date('2016-06-01T00:00:00.000Z'),
    endDate: new Date('2018-01-01T00:00:00.000Z'),
    cordID: 'Skuntank',
    acronym: 'dilfihess',
    kpiBaseName: 'SGSN_2012'
  },
    {
      startDate: new Date('2016-06-01T00:00:00.000Z'),
      endDate: new Date('2018-01-01T00:00:00.000Z'),
      cordID: 'Barboach',
      acronym: 'ubrerm',
      kpiBaseName: 'RNC_31'
    },
    {
      startDate: new Date('2016-01-01T00:00:00.000Z'),
      endDate: new Date('2017-09-01T00:00:00.000Z'),
      cordID: 'Magby',
      acronym: 'thruphroxtron',
      kpiBaseName: 'TRF_215'
    },
    {
      startDate: new Date('2017-01-01T00:00:00.000Z'),
      endDate: new Date('2017-03-01T00:00:00.000Z'),
      cordID: 'Magby',
      acronym: 'thruphroxtron',
      kpiBaseName: 'TRF_215'
    }
  ];

  public EXAMPLES_2DMAP = [{
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    cordID1: 'Mr. Mime',
    cordID2: 'Skuntank',
    kpiBaseName: 'RNC_31'
  }];

  constructor() {
  }

  testCase(formGroup: FormGroup, value: any) {
    formGroup.patchValue(value);
  }

}
