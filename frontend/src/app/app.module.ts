import {Map2dComponent} from './components/map2d/map2d.component';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {RestService} from './shared/services/rest.service';
import {CoverageComponent} from './components/coverage/coverage.component';
import {RouterModule} from '@angular/router';
import {routes} from './routes';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomepageComponent} from './shared/components/homepage/homepage.component';
import {OutliersComponent} from './components/outliers/outliers.component';
import {ChartModule} from 'primeng/chart';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TabMenuModule} from 'primeng/tabmenu';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {AggregatesHistogramComponent} from './components/aggregates-histogram/aggregates-histogram.component';
import {SharedFunctionsService} from './shared/services/shared.functions.service';
import {NotfoundComponent} from './shared/components/notfound/notfound.component';
import {DecompositionComponent} from './components/decomposition/decomposition.component';
import {DecompositionDisplayComponent} from './components/decomposition/decomposition-display/decomposition-display.component';
import {OutliersDisplayComponent} from './components/outliers/outliers-display/outliers-display.component';
import {AggregatesHistogramDisplayComponent} from './components/aggregates-histogram/aggregates-histogram-display/aggregates-histogram-display.component';
import {CoverageDisplayComponent} from './components/coverage/coverage-display/coverage-display.component';
import {Map2DDisplayComponent} from './components/map2d/map2d-display/map2d-display.component';
import {ExamplesService} from './shared/services/examples.service';
import {CacheDataService} from './shared/services/cache.data.service';
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';


@NgModule({
  declarations: [
    AppComponent,
    CoverageComponent,
    HomepageComponent,
    OutliersComponent,
    Map2dComponent,
    AggregatesHistogramComponent,
    NotfoundComponent,
    DecompositionComponent,
    DecompositionDisplayComponent,
    OutliersDisplayComponent,
    AggregatesHistogramDisplayComponent,
    CoverageDisplayComponent,
    Map2DDisplayComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    ChartModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatNativeDateModule
  ],
  exports: [
    RouterModule,
    BrowserAnimationsModule,
    TabMenuModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatNativeDateModule,
  ],
  providers: [RestService, SharedFunctionsService, ExamplesService, CacheDataService, {
    provide: MAT_DATE_LOCALE,
    useValue: 'pl-PL'
  }, {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE]
  }, {
    provide: MAT_DATE_FORMATS,
    useValue: MAT_MOMENT_DATE_FORMATS
  }],
  bootstrap: [AppComponent],
  entryComponents: [
    AggregatesHistogramDisplayComponent,
    CoverageDisplayComponent,
    DecompositionDisplayComponent,
    OutliersDisplayComponent,
    Map2DDisplayComponent]
})
export class AppModule {
}


