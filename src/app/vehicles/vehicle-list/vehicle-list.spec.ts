import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VehicleList } from './vehicle-list';
import { VehicleService } from '../vehicle.service';
import { of } from 'rxjs';
import { Vehicle } from '../vehicle.model';

const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 'veh_0001',
  account_id: 'acc_0001',
  vin: 'ABC123',
  plate: 'TEST001',
  make: 'Ford',
  model: 'Transit',
  year: 2022,
  device_id: 'dev_0001',
  status: 'active',
  last_known_location: { lat: 43.0, lng: -79.0, recorded_at: '2026-04-29T10:00:00Z' },
  ...overrides,
});

const MOCK_VEHICLES: Vehicle[] = [
  makeVehicle({ id: 'veh_0001', plate: 'AAA001', make: 'Ford',  status: 'active' }),
  makeVehicle({ id: 'veh_0002', plate: 'BBB002', make: 'Chevy', status: 'parked' }),
  makeVehicle({ id: 'veh_0003', plate: 'CCC003', make: 'Ford',  status: 'in_maintenance', last_known_location: null }),
];

function createComponent() {
  const vehicleService = {
    getVehicles: () => of(MOCK_VEHICLES),
    getEvents: () => of([]),
    getDevices: () => of([]),
  };

  TestBed.configureTestingModule({
    imports: [VehicleList],
    providers: [
      provideHttpClient(),
      { provide: VehicleService, useValue: vehicleService },
    ],
  });

  const fixture = TestBed.createComponent(VehicleList);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('VehicleList', () => {
  it('creates successfully', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('loads vehicles on init', () => {
    const { component } = createComponent();
    expect(component.vehicles().length).toBe(3);
  });

  it('shows all vehicles when no filters applied', () => {
    const { component } = createComponent();
    expect(component.filteredVehicles().length).toBe(3);
  });

  describe('filtering', () => {
    it('filters by exact plate match', () => {
      const { component } = createComponent();
      component.query.set('AAA001');
      expect(component.filteredVehicles().length).toBe(1);
      expect(component.filteredVehicles()[0].plate).toBe('AAA001');
    });

    it('filters by partial plate (case-insensitive)', () => {
      const { component } = createComponent();
      component.query.set('aaa');
      expect(component.filteredVehicles().length).toBe(1);
    });

    it('filters by make', () => {
      const { component } = createComponent();
      component.query.set('ford');
      expect(component.filteredVehicles().length).toBe(2);
    });

    it('filters by status', () => {
      const { component } = createComponent();
      component.selectedStatus.set('parked');
      expect(component.filteredVehicles().length).toBe(1);
      expect(component.filteredVehicles()[0].plate).toBe('BBB002');
    });

    it('filters by make dropdown', () => {
      const { component } = createComponent();
      component.selectedMake.set('Chevy');
      expect(component.filteredVehicles().length).toBe(1);
    });

    it('combines status and search filters', () => {
      const { component } = createComponent();
      component.selectedStatus.set('active');
      component.query.set('ford');
      expect(component.filteredVehicles().length).toBe(1);
    });

    it('returns empty array when no vehicles match', () => {
      const { component } = createComponent();
      component.query.set('ZZZNOMATCH');
      expect(component.filteredVehicles().length).toBe(0);
    });
  });

  describe('makes dropdown', () => {
    it('derives unique sorted makes from vehicles', () => {
      const { component } = createComponent();
      expect(component.makes()).toEqual(['all', 'Chevy', 'Ford']);
    });
  });

  describe('view mode', () => {
    it('defaults to list view', () => {
      const { component } = createComponent();
      expect(component.viewMode()).toBe('list');
    });

    it('switches to map view', () => {
      const { component } = createComponent();
      component.setView('map');
      expect(component.viewMode()).toBe('map');
    });
  });

  describe('detail panel', () => {
    it('opens detail panel on selectVehicle', () => {
      const { component } = createComponent();
      expect(component.selectedVehicle()).toBeNull();
      component.selectVehicle(MOCK_VEHICLES[0]);
      expect(component.selectedVehicle()?.id).toBe('veh_0001');
    });

    it('closes detail panel on closeDetail', () => {
      const { component } = createComponent();
      component.selectVehicle(MOCK_VEHICLES[0]);
      component.closeDetail();
      expect(component.selectedVehicle()).toBeNull();
    });
  });
});
