import { Component, input, output, computed, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Vehicle, FleetEvent, STATUS_LABELS } from '../vehicle.model';
import { RelativeTimePipe } from '../../core/pipes/relative-time.pipe';
import { parseTimestamp } from '../../core/parse-timestamp';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [RelativeTimePipe],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail implements AfterViewInit, OnDestroy {
  readonly vehicle = input.required<Vehicle>();
  readonly events = input<FleetEvent[]>([]);
  readonly close = output<void>();

  @ViewChild('miniMapContainer') miniMapContainerRef?: ElementRef<HTMLDivElement>;
  private miniMap?: L.Map;

  readonly locationName = signal<string | null>(null);
  readonly locationLoading = signal(false);

  readonly statusLabel = computed(() => STATUS_LABELS[this.vehicle().status] ?? this.vehicle().status);

  readonly recentEvents = computed(() =>
    this.events()
      .filter((e) => e.vehicle_id === this.vehicle().id)
      .sort(
        (a, b) =>
          (parseTimestamp(b.timestamp)?.getTime() ?? 0) -
          (parseTimestamp(a.timestamp)?.getTime() ?? 0),
      )
      .slice(0, 10),
  );

  readonly hasLocation = computed(() => this.vehicle().last_known_location !== null);

  ngAfterViewInit(): void {
    if (!this.hasLocation() || !this.miniMapContainerRef) return;

    const { lat, lng } = this.vehicle().last_known_location!;

    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.miniMap = L.map(this.miniMapContainerRef.nativeElement, {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.miniMap);
    L.marker([lat, lng]).addTo(this.miniMap);

    this.fetchLocationName(lat, lng);
  }

  private async fetchLocationName(lat: number, lng: number): Promise<void> {
    this.locationLoading.set(true);
    try {
      const response = await fetch(
        `/nominatim/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      const addr = data.address ?? {};
      const place =
        addr.city ?? addr.town ?? addr.village ??
        addr.municipality ?? addr.military ??
        addr.hamlet ?? addr.suburb ?? addr.county;
      const region = addr.state ?? addr.region;
      const country = addr.country_code?.toUpperCase();
      const parts = [place, region, country].filter(Boolean);
      this.locationName.set(
        parts.length > 0 ? parts.join(', ') : (data.display_name ?? null)
      );
    } catch {
      this.locationName.set(null);
    } finally {
      this.locationLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.miniMap?.remove();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('detail-backdrop')) {
      this.close.emit();
    }
  }
}
