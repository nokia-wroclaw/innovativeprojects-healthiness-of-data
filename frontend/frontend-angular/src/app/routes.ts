import { Routes } from '@angular/router';
import { CoverageComponent } from './components/coverage/coverage.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { OutliersComponent } from './components/outliers/outliers.component';


export const routes: Routes = [
	{ path: '', redirectTo: 'homepage', pathMatch: 'full' },
	{ path: 'coverage', component: CoverageComponent },
	{ path: 'homepage', component: HomepageComponent },
	{ path: 'outliers', component: OutliersComponent },
]