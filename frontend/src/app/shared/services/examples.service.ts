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
    }
  ];

  constructor() {
  }

  testCase(formGroup: FormGroup, value: any) {
    formGroup.patchValue(value);
  }

}
