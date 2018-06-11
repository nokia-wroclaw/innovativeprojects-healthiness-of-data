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
    cordID2: 'Lapras',
    kpiBaseName: 'RNC_31'
  },{
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

// 'Rapidash', 'Mime Jr.', 'Torkoal', 'Oricorio', 'Muk', 'Skarmory', 'Zekrom', 'Galvantula', 'Litleo', 'Popplio', 'Oddish', 'Sableye', 'Cranidos', 'Barboach', 'Ducklett', 'Staryu', 'Tyrogue', 'Pignite', 'Miltank', 'Krabby', 'Kricketune', 'Kricketot', 'Celesteela', 'Chimecho', 'Duosion', 'Mr. Mime', 'Aipom', 'Poliwag', 'Froakie', 'Hariyama', 'Binacle', 'Ivysaur', 'Brionne', 'Nidoqueen', 'Stoutland', 'Delcatty', 'Mienshao', 'Helioptile', 'Huntail', 'Carbink', 'Stantler', 'Alakazam', 'Dragalge', 'Maractus', 'Nidoking', 'Vikavolt', 'Dewott', 'Vanillite', 'Naganadel', 'Zeraora', 'Shiinotic', 'Pelipper', 'Shuckle', 'Cresselia', 'Baltoy', 'Snorlax', 'Excadrill', 'Primeape', 'Slowpoke', 'Kangaskhan', 'Torchic', 'Zangoose', 'Loudred', 'Haunter', 'Sentret', 'Registeel', 'Duskull', 'Lillipup', 'Quagsire', 'Lapras', 'Qwilfish', 'Togepi', 'Alomomola', 'Magby', 'Necrozma', 'Shellder', 'Sawsbuck', 'Braviary', 'Jellicent', 'Combee', 'Pyukumuku', 'Gorebyss', 'Eelektrik', 'Magnezone', 'Zygarde', 'Raikou', 'Ludicolo', 'Kartana', 'Omanyte', 'Jangmo-o', 'Cosmog', 'Tornadus', 'Cottonee', 'Audino', 'Spritzee', 'Piplup', 'Rotom', 'Braixen', 'Vigoroth', 'Timburr', 'Raticate', 'Carnivine', 'Gurdurr', 'Kabutops', 'Phione', 'Noctowl', 'Victreebel', 'Blaziken', 'Gible', 'Skuntank', 'Metagross', 'Tympole', 'Vulpix'}
