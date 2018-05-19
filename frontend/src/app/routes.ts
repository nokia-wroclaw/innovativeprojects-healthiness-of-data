import {Routes} from '@angular/router';
import {Map2dComponent} from './components/map2d/map2d.component';
import {CoverageComponent} from './components/coverage/coverage.component';
import {OutliersComponent} from './components/outliers/outliers.component';
import {HomepageComponent} from './shared/components/homepage/homepage.component';
import {NotfoundComponent} from './shared/components/notfound/notfound.component';
import {DecompositionComponent} from './components/decomposition/decomposition.component';
import {AggregatesHistogramComponent} from './components/aggregates-histogram/aggregates-histogram.component';
import {CommonwealthComponent} from './components/commonwealth/commonwealth.component';

export const routes: Routes = [
  {path: '', redirectTo: 'homepage', pathMatch: 'full'},
  {path: 'homepage', component: HomepageComponent},
  {
    path: 'components', component: CommonwealthComponent, children: [
      {path: 'aggregatesandhistogram', component: AggregatesHistogramComponent},
      {path: 'coverage', component: CoverageComponent},
      {path: 'decomposition', component: DecompositionComponent},
      {path: 'outliers', component: OutliersComponent},
      {path: 'map2d', component: Map2dComponent}
    ]
  },

  {path: '**', component: NotfoundComponent}

];
