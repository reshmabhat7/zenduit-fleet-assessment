import { Injectable } from '@angular/core';
import { Vehicle, STATUS_LABELS } from './vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleExportService {
  exportCsv(vehicles: Vehicle[], filename = 'fleet-export.csv'): void {
    const headers = ['ID', 'Plate', 'Make', 'Model', 'Year', 'Status', 'Account', 'Device', 'VIN', 'Last Seen', 'Lat', 'Lng'];

    const rows = vehicles.map((v) => [
      v.id,
      v.plate,
      v.make,
      v.model,
      v.year,
      STATUS_LABELS[v.status] ?? v.status,
      v.account_id,
      v.device_id,
      v.vin,
      v.last_known_location?.recorded_at ?? '',
      v.last_known_location?.lat ?? '',
      v.last_known_location?.lng ?? '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map(this.escapeCsvCell).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private escapeCsvCell(value: unknown): string {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
