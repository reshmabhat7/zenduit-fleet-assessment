export type VehicleStatus = 'active' | 'parked' | 'in_maintenance' | 'decommissioned';

export type EventType =
  | 'gps_ping'
  | 'harsh_brake'
  | 'ignition_on'
  | 'ignition_off'
  | 'speeding'
  | 'geofence_enter'
  | 'geofence_exit';

export type ViewMode = 'list' | 'map';

export interface VehicleLocation {
  lat: number;
  lng: number;
  recorded_at: string;
}

export interface Vehicle {
  id: string;
  account_id: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  device_id: string;
  status: VehicleStatus;
  last_known_location: VehicleLocation | null;
}

export interface FleetEvent {
  id: string;
  vehicle_id: string;
  device_id: string;
  type: EventType;
  timestamp: string;
  location: { lat: number; lng: number } | null;
  payload: Record<string, unknown>;
}

export interface Device {
  id: string;
  serial: string;
  firmware_version: string;
  account_id: string;
}

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  active: 'Active',
  parked: 'Parked',
  in_maintenance: 'In Maintenance',
  decommissioned: 'Decommissioned',
};
