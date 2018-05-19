import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {RestService} from '../../../shared/services/rest.service';
import {SharedFunctionsService} from '../../../shared/services/shared.functions.service';

@Component({
  selector: 'app-map2d-display',
  templateUrl: './map2d-display.component.html',
  styleUrls: ['./map2d-display.component.css']
})
export class Map2DDisplayComponent implements OnInit, AfterViewInit {


  @Input() map2DParams: FormGroup;
  @Input() id = 0;
  @Output() removeId = new EventEmitter<number>();

  fetchedIn: number;

  startDate: any;
  endDate: any;
  cordID: string;
  map2DLoading = false;
  map2DLoaded = false;

  constructor(private restService: RestService,
              private formBuilder: FormBuilder,
              private sharedFunctions: SharedFunctionsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

    this.map2DLoading = true;
    this.cdRef.detectChanges();

    this.startDate = this.sharedFunctions.parseDate(this.map2DParams.value.startDate);
    this.endDate = this.sharedFunctions.parseDate(this.map2DParams.value.endDate);
    this.cordID = this.map2DParams.value.cordID;


    const url = ''; // this.sharedFunctions.generateURL(this.map2DParams, 'map2D');

    const start = new Date().getTime();
    this.restService.getAll(url).then((response) => {
      if (response.status === 200) {
        this.fetchedIn = new Date().getTime() - start;


        this.map2DLoaded = true;
      } else {
        this.sharedFunctions.openSnackBar('Error ' + response.status + ': ' + response.data.error, 'OK');
      }
      this.map2DLoading = false;
    }).catch((error) => {
      console.log('error');
      console.log(error);
      this.sharedFunctions.openSnackBar('Error: ' + 'backend error', 'OK');
    });
  }


  removeComponent() {
    console.log('component removed: ' + this.id);
    this.removeId.emit(this.id);
  }
}
