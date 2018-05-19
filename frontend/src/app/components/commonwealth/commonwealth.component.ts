import {Component, ComponentFactoryResolver, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {OutliersDisplayComponent} from '../outliers/outliers-display/outliers-display.component';
import {AggregatesHistogramDisplayComponent} from '../aggregates-histogram/aggregates-histogram-display/aggregates-histogram-display.component';
import {RouterCommunicationService} from '../../shared/services/router-communication/router-communication.service';

@Component({
  selector: 'app-commonwealth',
  templateUrl: './commonwealth.component.html',
  styleUrls: ['./commonwealth.component.css']
})
export class CommonwealthComponent implements OnInit {

  id = 0;
  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  components = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private routerCommunicationService: RouterCommunicationService) {
    this.routerCommunicationService.changeEmitted$.subscribe((readyPackage) => {
      this.createComponent(readyPackage.params, readyPackage.componentClass);
    });
  }

  ngOnInit() {

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
