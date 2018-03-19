import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { RestService } from './services/rest.service';
import { CoverageComponent } from './components/coverage/coverage.component';
import { RouterModule } from '@angular/router';
import { routes } from './routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomepageComponent } from './components/homepage/homepage.component';
import { OutliersComponent } from './components/outliers/outliers.component';
import { ChartModule } from 'primeng/chart';

@NgModule({
	declarations: [
		AppComponent,
		CoverageComponent,
		HomepageComponent,
		OutliersComponent
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes),
		FormsModule,
		ReactiveFormsModule,
		ChartModule
	],
	exports: [
		RouterModule
	],
	providers: [RestService],
	bootstrap: [AppComponent]
})
export class AppModule {
}
