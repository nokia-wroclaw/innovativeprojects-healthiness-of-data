import { Routes } from '@angular/router';
import { CoverageComponent } from './coverage/coverage.component';
import { HomepageComponent } from './homepage/homepage.component';


export const routes: Routes = [
	{ path: '', redirectTo: 'homepage', pathMatch: 'full' },
	{ path: 'coverage', component: CoverageComponent },
	{ path: 'homepage', component: HomepageComponent }
]