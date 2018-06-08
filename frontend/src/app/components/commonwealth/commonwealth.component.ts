import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';

import {CompactType, GridsterConfig, GridsterItem, GridsterItemComponent, GridsterPush, GridType} from 'angular-gridster2';

@Component({
  selector: 'app-commonwealth',
  templateUrl: './commonwealth.component.html',
  styleUrls: ['./commonwealth.component.css']
})
export class CommonwealthComponent implements OnInit {

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  components = [];
  component;

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
      gridType: GridType.Fit,
      compactType: CompactType.None,
      pushItems: true,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    };

    this.dashboard = [
      {cols: 1, rows: 1, y: 0, x: 0, initCallback: this.initItem.bind(this)}
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
    console.log(this)
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

}
