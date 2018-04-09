import {Map2dComponent} from './components/map2d/map2d.component';
import {PeriodicityComponent} from './components/periodicity/periodicity.component';
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
import {DraftComponent} from './components/draft/draft.component';
import {AutocompleteChipsComponent} from './shared/components/autocomplete-chips/autocomplete-chips.component';
import {CacheDataComponent} from './shared/components/cache-data/cache-data.component';
import {TrendComponent} from './components/trend/trend.component';
import {AggregatesHistogramComponent} from './components/aggregates-histogram/aggregates-histogram.component';
import {AboutComponent} from './shared/components/about/about.component';
import {SharedFunctionsService} from './shared/services/shared.functions.service';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { DecompositionComponent } from './components/decomposition/decomposition.component';


@NgModule({
  declarations: [
    AppComponent,
    CoverageComponent,
    HomepageComponent,
    OutliersComponent,
    DraftComponent,
    AutocompleteChipsComponent,
    CacheDataComponent,
    PeriodicityComponent,
    Map2dComponent,
    TrendComponent,
    AggregatesHistogramComponent,
    AboutComponent,
    NotfoundComponent,
    DecompositionComponent
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
  providers: [RestService, CacheDataComponent, SharedFunctionsService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
