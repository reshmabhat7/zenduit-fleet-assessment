import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Device, FleetEvent, Vehicle } from './vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('/dataset/vehicles.json').pipe(
      delay(300),
      map((vehicles) => vehicles.map((v) => ({ ...v, plate: v.plate.trim() }))),
    );
  }

  getEvents(): Observable<FleetEvent[]> {
    return this.http.get<FleetEvent[]>('/dataset/events.json').pipe(delay(300));
  }

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>('/dataset/devices.json').pipe(delay(300));
  }
}
