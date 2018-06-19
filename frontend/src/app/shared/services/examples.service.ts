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
    chips: ['Mr. Mime', 'Lapras', 'Dragalge', 'Naganadel', 'Pelipper', 'Piplup', 'Rotom', 'Vigoroth', 'Timburr', 'Raticate']
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
  }];

  constructor() {
  }

  testCase(formGroup: FormGroup, value: any) {
    formGroup.patchValue(value);
  }

}

// 'Rapidash', 'Mime Jr.', 'Torkoal', 'Oricorio', 'Muk', 'Skarmory', 'Zekrom', 'Galvantula', 'Litleo', 'Popplio', 'Oddish', 'Sableye', 'Cranidos', 'Barboach', 'Ducklett', 'Staryu', 'Tyrogue', 'Pignite', 'Miltank', 'Krabby', 'Kricketune', 'Kricketot', 'Celesteela', 'Chimecho', 'Duosion', 'Mr. Mime', 'Aipom', 'Poliwag', 'Froakie', 'Hariyama', 'Binacle', 'Ivysaur', 'Brionne', 'Nidoqueen', 'Stoutland', 'Delcatty', 'Mienshao', 'Helioptile', 'Huntail', 'Carbink', 'Stantler', 'Alakazam', 'Dragalge', 'Maractus', 'Nidoking', 'Vikavolt', 'Dewott', 'Vanillite', 'Naganadel', 'Zeraora', 'Shiinotic', 'Pelipper', 'Shuckle', 'Cresselia', 'Baltoy', 'Snorlax', 'Excadrill', 'Primeape', 'Slowpoke', 'Kangaskhan', 'Torchic', 'Zangoose', 'Loudred', 'Haunter', 'Sentret', 'Registeel', 'Duskull', 'Lillipup', 'Quagsire', 'Lapras', 'Qwilfish', 'Togepi', 'Alomomola', 'Magby', 'Necrozma', 'Shellder', 'Sawsbuck', 'Braviary', 'Jellicent', 'Combee', 'Pyukumuku', 'Gorebyss', 'Eelektrik', 'Magnezone', 'Zygarde', 'Raikou', 'Ludicolo', 'Kartana', 'Omanyte', 'Jangmo-o', 'Cosmog', 'Tornadus', 'Cottonee', 'Audino', 'Spritzee', 'Piplup', 'Rotom', 'Braixen', 'Vigoroth', 'Timburr', 'Raticate', 'Carnivine', 'Gurdurr', 'Kabutops', 'Phione', 'Noctowl', 'Victreebel', 'Blaziken', 'Gible', 'Skuntank', 'Metagross', 'Tympole', 'Vulpix'}
