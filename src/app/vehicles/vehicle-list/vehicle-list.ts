import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../vehicle.service';
import { VehicleExportService } from '../vehicle-export.service';
import { Vehicle, VehicleStatus, FleetEvent, ViewMode, STATUS_LABELS } from '../vehicle.model';
import { VehicleDetail } from '../vehicle-detail/vehicle-detail';
import { VehicleMap } from '../vehicle-map/vehicle-map';
import { RelativeTimePipe } from '../../core/pipes/relative-time.pipe';

type StatusFilter = VehicleStatus | 'all';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [FormsModule, VehicleDetail, VehicleMap, RelativeTimePipe],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.scss',
})
export class VehicleList implements OnInit {
  private vehicleService = inject(VehicleService);
  private exportService = inject(VehicleExportService);

  // --- raw data ---
  readonly vehicles = signal<Vehicle[]>([]);
  readonly events = signal<FleetEvent[]>([]);
  readonly loading = signal(true);

  // --- filter state ---
  readonly query = signal('');
  readonly selectedStatus = signal<StatusFilter>('all');
  readonly selectedMake = signal('all');
  readonly viewMode = signal<ViewMode>('list');

  // --- detail panel ---
  readonly selectedVehicle = signal<Vehicle | null>(null);

  // --- pagination ---
  readonly currentPage = signal(1);
  readonly pageSize = signal(50);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredVehicles().length / this.pageSize()))
  );

  readonly pagedVehicles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredVehicles().slice(start, start + this.pageSize());
  });

  readonly pageStart = computed(() =>
    this.filteredVehicles().length === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredVehicles().length)
  );

  // --- derived ---
  readonly makes = computed(() => {
    const all = [...new Set(this.vehicles().map((v) => v.make))].sort();
    return ['all', ...all];
  });

  readonly filteredVehicles = computed(() => {
    const q = this.query().trim().toLowerCase();
    const status = this.selectedStatus();
    const make = this.selectedMake();

    return this.vehicles().filter((v) => {
      const matchesSearch =
        q === '' ||
        v.plate.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        `${v.make} ${v.model}`.toLowerCase().includes(q);

      const matchesStatus = status === 'all' || v.status === status;
      const matchesMake = make === 'all' || v.make === make;

      return matchesSearch && matchesStatus && matchesMake;
    });
  });

  readonly statuses: StatusFilter[] = ['all', 'active', 'parked', 'in_maintenance', 'decommissioned'];
  readonly statusLabels = STATUS_LABELS;
  readonly pageSizeOptions = [20, 50, 100];

  constructor() {
    effect(() => {
      this.filteredVehicles();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.vehicleService.getEvents().subscribe((events) => {
      this.events.set(events);
    });
  }

  selectVehicle(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
  }

  closeDetail(): void {
    this.selectedVehicle.set(null);
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  exportCsv(): void {
    this.exportService.exportCsv(this.filteredVehicles(), 'fleet-vehicles.csv');
  }

  labelForStatus(status: VehicleStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  get hasActiveFilters(): boolean {
    return this.query() !== '' || this.selectedStatus() !== 'all' || this.selectedMake() !== 'all';
  }

  clearFilters(): void {
    this.query.set('');
    this.selectedStatus.set('all');
    this.selectedMake.set('all');
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }
}
