import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { VehicleService } from './vehicle.service';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('trims leading/trailing whitespace from plate numbers', async () => {
    const promise = firstValueFrom(service.getVehicles());

    const req = httpMock.expectOne('/dataset/vehicles.json');
    req.flush([{
      id: 'veh_dirty',
      plate: '  2IME529  ',
      make: 'Ford',
      model: 'Transit',
      year: 2024,
      status: 'active',
      device_id: 'dev_001',
      account_id: 'acc_001',
      vin: 'ABC123',
      last_known_location: null,
    }]);

    const vehicles = await promise;
    const dirty = vehicles.find((v) => v.id === 'veh_dirty');
    expect(dirty?.plate).toBe('2IME529');
  });

  it('getEvents fetches from events endpoint', async () => {
    const promise = firstValueFrom(service.getEvents());

    const req = httpMock.expectOne('/dataset/events.json');
    req.flush([{
      id: 'evt_001',
      vehicle_id: 'veh_0001',
      device_id: 'dev_001',
      type: 'gps_ping',
      timestamp: '2026-04-30T10:00:00Z',
      location: null,
      payload: {},
    }]);

    const events = await promise;
    expect(events.length).toBe(1);
  });
});
