import {Routes} from '@angular/router';
import {CoverageComponent} from './components/coverage/coverage.component';
import {HomepageComponent} from './shared/components/homepage/homepage.component';
import {OutliersComponent} from './components/outliers/outliers.component';
import {DraftComponent} from './components/draft/draft.component';
import {Map2dComponent} from './components/map2d/map2d.component';
import {PeriodicityComponent} from './components/periodicity/periodicity.component';
import {AggregatesHistogramComponent} from './components/aggregates-histogram/aggregates-histogram.component';
import {TrendComponent} from './components/trend/trend.component';
import {AboutComponent} from './shared/components/about/about.component';


export const routes: Routes = [
  {path: '', redirectTo: 'homepage', pathMatch: 'full'},
  {path: 'homepage', component: HomepageComponent},

  {path: 'aggregatesandhistogram', component: AggregatesHistogramComponent},
  {path: 'coverage', component: CoverageComponent},
  {path: 'outliers', component: OutliersComponent},
  {path: 'map2d', component: Map2dComponent},
  {path: 'periodicity', component: PeriodicityComponent},
  {path: 'trend', component: TrendComponent},

  {path: 'about', component: AboutComponent},

  {path: 'draft', component: DraftComponent},
];
