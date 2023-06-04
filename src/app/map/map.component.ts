import {Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import H, {ui} from "@here/maps-api-for-javascript";
import onResize from "simple-element-resize-detector";
import {Schedule} from "../shared/interfaces/schedule";
import { environment } from '../../environment/environment';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Output() newAddressEvent = new EventEmitter<{ title: string, position: { lat: number, lng: number } }>();
  @Input() taped?: string | undefined;
  @Output() tapedChange = new EventEmitter<string | undefined>;
  private map?: H.Map;
  public zoom = 7;
  public lat = 49;
  public lng = 31;
  public currentMarker?: H.map.Marker;
  @ViewChild('map') mapDiv?: ElementRef;
  behaviour?: H.mapevents.Behavior;
  @Input() addMainPoint: boolean = false;
  @Input() addSearchPoints: Schedule[] = [];
  public searchMarkers: H.map.Marker[] = [];
  public svgTemp = '<svg style="left:-14px;top:-36px;" xmlns="http://www.w3.org/2000/svg" width="28px" height="36px" >' +
    '<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19 29.3 19 31 Z" fill="#00" fill-opacity=".2"></path>' +
    '<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff" ></path>' +
    '<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="${COLOR}"></path>' +
    '<text transform="matrix( 1 0 0 1 13 18 )" x="0" y="0" fill-opacity="1" fill="#fff" text-anchor="middle" font-weight="bold" font-size="7px" font-family="arial">${TEXT}</text></svg>'
  geocoder?: H.service.SearchService;

  ngAfterViewInit(): void {
    if (!this.map && this.mapDiv) {
      const platform = new H.service.Platform({
        apikey: environment.mapApiKey
      });
      const layers = platform.createDefaultLayers();
      const map = new H.Map(
        this.mapDiv.nativeElement,

        (layers as any).vector.normal.map,
        {
          pixelRatio: window.devicePixelRatio,
          center: {lat: this.lat, lng: this.lng},
          zoom: this.zoom,
        },
      );
      this.map = map;
      onResize(this.mapDiv.nativeElement, () => {
        map.getViewPort().resize();
      });
      this.map = map;
      this.behaviour = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      this.geocoder = platform.getSearchService()
    }
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    const explore = changes['addMainPoint'];
    const schedules = changes['addSearchPoints'];
    const taped = changes['taped'];
    if (explore && explore.currentValue === true) {
      this.addCurrentPlace()
    } else if (explore && explore.currentValue !== true) {
      if (this.currentMarker) {
        // @ts-ignore
        this.map.removeObject(this.currentMarker);
        this.currentMarker = undefined;
      }
    }
    if ((schedules && schedules.currentValue) || (taped && !taped.currentValue)) {
      // @ts-ignore
      this.map.removeObjects(this.searchMarkers);
      this.searchMarkers = []
      this.addSearchPlaces()
    } else if (schedules && !schedules.currentValue) {
      // @ts-ignore
      this.map.removeObjects(this.searchMarkers);
      this.searchMarkers = []
    }
  }

  addSearchPlaces() {
    if (!this.map || !this.behaviour) {
      return;
    }
    let icon_svg = this.svgTemp
    let icon = new H.map.Icon(icon_svg.replace('${COLOR}', 'rgb(27, 74, 156)').replace('${TEXT}', ''), {
      size: {
        h: 50,
        w: 40
      }
    });
    this.addSearchPoints.forEach((schedule) => {
      const marker = new H.map.Marker({
        lat: schedule.event.place.latitude,
        lng: schedule.event.place.longitude
      }, {data: schedule.id, icon: icon})
      this.searchMarkers.push(marker)
      marker.addEventListener('tap', (ev: any) => {
        let icon_svg = this.svgTemp
        let icon = new H.map.Icon(icon_svg.replace('${COLOR}', 'rgb(27, 74, 156)').replace('${TEXT}', ''), {
          size: {
            h: 50,
            w: 40
          }
        });
        if (!this.map || !this.behaviour) {
          return;
        }
        this.searchMarkers.forEach((m) => {
          m.setIcon(icon);

        })
        icon = new H.map.Icon(icon_svg.replace('${COLOR}', 'rgb(40, 90, 240)').replace('${TEXT}', ''), {
          size: {
            h: 60,
            w: 50
          }
        });
        marker.setIcon(icon);
        this.tapedChange.emit(marker.getData())
      }, false);

    })
    this.map.addObjects(this.searchMarkers);
  }

  addCurrentPlace() {
    if (!this.map || !this.behaviour) {
      return;
    }
    const point = this.map.getCenter()
    if (!this.currentMarker) {
      let icon_svg = this.svgTemp
      let icon = new H.map.Icon(icon_svg.replace('${COLOR}', 'rgb(233, 148, 91)').replace('${TEXT}', 'Me'), {
        size: {
          h: 60,
          w: 50
        }
      });

      this.currentMarker = new H.map.Marker(point, {data: "Me", icon: icon});
      // @ts-ignore

      this.currentMarker.draggable = true;
    } else {
      this.currentMarker.setGeometry(this.map.getCenter())
    }
    this.map.addObject(this.currentMarker);
    // @ts-ignore
    this.geocoder.reverseGeocode(
      {
        at: `${point.lat},${point.lng}`,
        limit: '1'
      },
      this.OnSuccess.bind(this),
      this.OnError
    );
    this.currentMarker.addEventListener('dragstart', (ev: any) => {
      if (!this.map || !this.behaviour) {
        return;
      }
      let target = ev.target

      if (target instanceof H.map.Marker) {
        // @ts-ignore
        let targetPosition: H.math.Point = this.map.geoToScreen(target.getGeometry());
        let pointer = ev.currentPointer;
        // @ts-ignore
        ev.target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
        this.behaviour.disable();
      }
    }, false);


    // re-enable the default draggability of the underlying map
    // when dragging has completed
    this.currentMarker.addEventListener('dragend', (ev: any) => {
      if (!this.map || !this.behaviour) {
        return;
      }
      let target = ev.target;
      if (target instanceof H.map.Marker) {
        this.behaviour.enable();
      }
      const point = ev.target.getGeometry()
      // @ts-ignore
      this.geocoder.reverseGeocode(
        {
          at: `${point.lat},${point.lng}`,
          limit: '1'
        },
        this.OnSuccess.bind(this),
        this.OnError
      );
    }, false);

    // Listen to the drag event and move the position of the marker
    // as necessary
    this.currentMarker.addEventListener('drag', (ev: any) => {
      let target = ev.target
      let pointer = ev.currentPointer;
      if (target instanceof H.map.Marker) {
        // @ts-ignore
        ev.target.setGeometry(this.map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
      }
    }, false);

  }

  OnSuccess(result: Object) {
    // @ts-ignore
    this.newAddressEvent.emit(result.items[0]);

  }

  OnError(error: Error) {
    alert(error);
  }
}
