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

  public EXAMPLES_COVERAGE = [
    {
      startDate: new Date('2016-09-01T00:00:00.000Z'),
      endDate: new Date('2017-05-15T00:00:00.000Z'),
      cordID: 'Mr. Mime',
      chipsAcronyms: ['threarirzearr', 'toubrishik', 'threghix'],
      chipsKpiBasenames: ['TRF_215', 'RNC_31']
    }
  ];

  public EXAMPLES_2DMAP = [{
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    kpiBaseName: 'RNC_31',
    otherDate: '',
    chips: ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel', 'Pelipper', 'Piplup', 'Rotom', 'Vigoroth', 'Timburr', 'Raticate', 'Gurdurr', 'Metagross', 'Baltoy']
  }, {
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    kpiBaseName: 'RNC_31',
    otherDate: '',
    chips: ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel', 'Pelipper', 'Piplup']
  }, {
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    kpiBaseName: 'RNC_31',
    otherDate: '',
    chips: ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel']
  }, {
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    kpiBaseName: 'RNC_31',
    otherDate: new Date('2017-03-01T00:00:00.000Z'),
    chips: ['Dragalge', 'Pelipper', 'Rotom', 'Vigoroth', 'Timburr', 'Raticate']
  }, {
    startDate: new Date('2017-06-01T00:00:00.000Z'),
    endDate: new Date('2017-09-01T00:00:00.000Z'),
    kpiBaseName: 'RNC_31',
    otherDate: '',
    chips: ['Mime Jr.', 'Muk', 'Skarmory',  'Galvantula', 'Popplio' , 'Sableye', 'Barboach', 'Staryu', 'Tyrogue', 'Pignite', 'Miltank', 'Krabby', 'Celesteela', 'Duosion', 'Mr. Mime', 'Aipom', 'Poliwag',  'Hariyama', 'Ivysaur', 'Delcatty',  'Helioptile', 'Huntail', 'Stantler', 'Dragalge', 'Nidoking', 'Vikavolt', 'Vanillite', 'Naganadel', 'Zeraora', 'Shiinotic', 'Pelipper', 'Shuckle', 'Cresselia', 'Baltoy', 'Snorlax', 'Excadrill', 'Primeape', 'Slowpoke', 'Kangaskhan', 'Sentret', 'Registeel',  'Lillipup', 'Quagsire', 'Lapras', 'Alomomola', 'Necrozma', 'Sawsbuck', 'Jellicent', 'Combee', 'Pyukumuku', 'Gorebyss', 'Eelektrik', 'Magnezone', 'Zygarde', 'Raikou', 'Ludicolo', 'Kartana',  'Cosmog', 'Tornadus', 'Cottonee', 'Audino', 'Spritzee', 'Piplup', 'Rotom', 'Vigoroth', 'Timburr', 'Raticate',  'Gurdurr', 'Kabutops', 'Noctowl',  'Blaziken', 'Gible', 'Skuntank', 'Metagross', 'Tympole', 'Vulpix']
  }];

  constructor() {
  }

  testCase(formGroup: FormGroup, value: any) {
    formGroup.patchValue(value);
  }

}
