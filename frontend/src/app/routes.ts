import {Routes} from '@angular/router';
import {CoverageComponent} from './components/coverage/coverage.component';
import {HomepageComponent} from './shared/components/homepage/homepage.component';
import {OutliersComponent} from './components/outliers/outliers.component';
import {DraftComponent} from './components/draft/draft.component';
import {Map2dComponent} from './components/map2d/map2d.component';
import {AggregatesHistogramComponent} from './components/aggregates-histogram/aggregates-histogram.component';
import {NotfoundComponent} from './shared/components/notfound/notfound.component';
import {DecompositionComponent} from './components/decomposition/decomposition.component';


export const routes: Routes = [
  {path: '', redirectTo: 'homepage', pathMatch: 'full'},
  {path: 'homepage', component: HomepageComponent},

  {path: 'aggregatesandhistogram', component: AggregatesHistogramComponent},
  {path: 'coverage', component: CoverageComponent},
  {path: 'decomposition', component: DecompositionComponent},
  {path: 'outliers', component: OutliersComponent},
  {path: 'map2d', component: Map2dComponent},
  {path: 'draft', component: DraftComponent},
  {path: '**', component: NotfoundComponent}


];
