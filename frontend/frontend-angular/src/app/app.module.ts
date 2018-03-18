import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ExampleComponent } from './example/example.component';
import { RestService } from './services/rest.service';
import { CoverageComponent } from './coverage/coverage.component';
import { RouterModule } from '@angular/router';
import { routes } from './routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomepageComponent } from './homepage/homepage.component';

@NgModule({
	declarations: [
		AppComponent,
		ExampleComponent,
		CoverageComponent,
		HomepageComponent
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes),
		FormsModule,
		ReactiveFormsModule
	],
	exports: [
		RouterModule
	],
	providers: [RestService],
	bootstrap: [AppComponent]
})
export class AppModule {
}


