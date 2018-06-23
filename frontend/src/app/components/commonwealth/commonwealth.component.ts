import {
  ChangeDetectionStrategy, Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';

import {CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType} from 'angular-gridster2';

@Component({
  selector: 'app-commonwealth',
  templateUrl: './commonwealth.component.html',
  styleUrls: ['./commonwealth.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CommonwealthComponent implements OnInit {

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  components = [];
  component;
  comp;
  inputs;
  outputs;

  options: GridsterConfig;
  dashboard: Array<GridsterItem>;
  itemToPush: GridsterItemComponent;


  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private routerCommunicationService: RouterCommunicationService) {
    this.routerCommunicationService.changeEmitted$.subscribe((readyPackage) => {
      this.createComponent(readyPackage.params, readyPackage.componentClass);
    });
  }


  ngOnInit() {
    this.options = {
      gridType: GridType.ScrollVertical,
      compactType: CompactType.CompactUpAndLeft,
      margin: 10,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      mobileBreakpoint: 640,
      minCols: 1,
      maxCols: 100,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 2,
      defaultItemRows: 1,
      // fixedColWidth: 20,
      // fixedRowHeight: 20,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
      displayGrid: DisplayGrid.Always,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false
    };

    this.dashboard = [
      // {cols: 1, rows: 1, y: 0, x: 0, initCallback: this.initItem.bind(this)}
    ];
  }

  changedOptions() {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  removeItem($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.dashboard.splice(this.dashboard.indexOf(item), 1);
  }

  addItem() {
    this.dashboard.push({x: 0, y: 0, cols: 1, rows: 1});
  }

  initItem(item: GridsterItem, itemComponent: GridsterItemComponent) {
    console.log(this);
    this.itemToPush = itemComponent;
  }

  pushItem() {
    const push = new GridsterPush(this.itemToPush); // init the service
    this.itemToPush.$item.rows += 4; // move/resize your item
    if (push.pushItems(push.fromNorth)) { // push items from a direction
      push.checkPushBack(); // check for items can restore to original position
      push.setPushedItems(); // save the items pushed
      this.itemToPush.setSize();
      this.itemToPush.checkItemChanges(this.itemToPush.$item, this.itemToPush.item);
    } else {
      this.itemToPush.$item.rows -= 4;
      push.restoreItems(); // restore to initial state the pushed items
    }
    push.destroy(); // destroy push instance
    // similar for GridsterPushResize and GridsterSwap
  }

  createComponent(params: any, componentClass: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory, 0);
    component.instance.removeId.subscribe(
      (event: any) => {
        this.removeComponent(event.typeOfComponent, event.removeId);
      }
    );
    component.instance.id = this.id;
    component.instance.params = params;
    this.component = component;
    this.components.push(component);
    this.id++;
  }

  removeComponent(dynamicChildClass: Type<any>, id: number) {
    const component = this.components[id];
    const componentIndex = this.components.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
    }
  }

  createComponent2(params: any, componentClass: Type<any>) {
    this.inputs = {
      id: this.id,
      params: params
    };
    this.outputs = {
      removeId: (id) => {
        this.removeComponent2(id.removeId);
        this.dashboard[id] = null;
      }

    };
    this.comp = componentClass;
    this.dashboard[this.id] = {cols: 2, rows: 1, y: 0, x: 0};
    // this.dashboard.push({cols: 2, rows: 1, y: 0, x: 0});
    this.id++;
  }

  removeComponent2(id: number) {
    const component = this.components[id];
    const componentIndex = this.components.indexOf(component);
    if (componentIndex !== -1) {
      this.container.remove(this.container.indexOf(component));
    }
  }

}
