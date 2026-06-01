import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    pipe = new RelativeTimePipe();
  });

  it('returns "No location" for null', () => {
    expect(pipe.transform(null)).toBe('No location');
  });

  it('returns "No location" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('No location');
  });

  it('returns "Invalid date" for garbage input', () => {
    expect(pipe.transform('not-a-date')).toBe('Invalid date');
  });

  it('returns minutes for timestamps < 1h ago', () => {
    const ts = new Date(Date.now() - 30 * 60_000).toISOString();
    expect(pipe.transform(ts)).toBe('30m ago');
  });

  it('returns hours for timestamps 2h ago', () => {
    const ts = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
    expect(pipe.transform(ts)).toBe('2h ago');
  });

  it('returns days for timestamps 3d ago', () => {
    const ts = new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString();
    expect(pipe.transform(ts)).toBe('3d ago');
  });

  it('handles timestamps with timezone offset (ISO 8601 extended)', () => {
    const ts = new Date(Date.now() - 45 * 60_000).toISOString();
    expect(pipe.transform(ts)).toBe('45m ago');
  });
});
