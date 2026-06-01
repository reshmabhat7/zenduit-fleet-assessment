import {
  Component,
  input,
  output,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
} from '@angular/core';
import { Vehicle } from '../vehicle.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-map',
  standalone: true,
  templateUrl: './vehicle-map.html',
  styleUrl: './vehicle-map.scss',
})
export class VehicleMap implements AfterViewInit, OnChanges, OnDestroy {
  readonly vehicles = input<Vehicle[]>([]);
  readonly vehicleSelected = output<Vehicle>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  readonly placedCount = signal(0);
  readonly unplacedCount = signal(0);

  private map: L.Map | undefined;
  private markerLayer: L.LayerGroup | undefined;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(): void {
    if (this.map) {
      this.refreshMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.map = L.map(this.mapContainer.nativeElement).setView([39.5, -98.35], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.refreshMarkers();
  }

  private refreshMarkers(): void {
    this.markerLayer?.clearLayers();

    const withLocation = this.vehicles().filter((v) => v.last_known_location !== null);
    this.placedCount.set(withLocation.length);
    this.unplacedCount.set(this.vehicles().length - withLocation.length);

    withLocation.forEach((v) => {
      const { lat, lng } = v.last_known_location!;
      const marker = L.marker([lat, lng]).addTo(this.markerLayer!);
      marker.bindTooltip(`<strong>${v.plate}</strong><br>${v.make} ${v.model} · ${v.status}`);
      marker.on('click', () => this.vehicleSelected.emit(v));
    });
  }
}
