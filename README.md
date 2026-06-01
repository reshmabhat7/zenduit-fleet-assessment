# ZenduFleet - Fleet Workflow Screen

A workflow screen for fleet managers to monitor vehicles, inspect records, view locations on a map, and export data. Built on Angular 21 with standalone components and signals.

---

## Setup & running

**Quick setup - run this once after cloning:**
```bash
./setup.sh
```

Or manually:
```bash
nvm use 22        # Angular 21 requires Node ≥ 20.19
npm install
npm start         # http://localhost:4200
npm test          # 26 unit tests (Vitest)
npm run build     # production build → dist/
```

---

## What was built

### Features
- **Search** - filter by plate, VIN, or make/model (live, case-insensitive)
- **Status & make filters** - combinable dropdowns; count shows "X of Y vehicles"
- **Clear filters button** - appears only when a filter is active; resets all filters in one click
- **Pagination** - 20/50/100 per page; auto-resets on filter change; hidden in map view and when results fit one page
- **Detail panel** - click any row or map marker to open a slide-in panel showing status, identifiers, last known location, and recent events; close via ✕ or backdrop click
- **Mini map in detail panel** - regional-zoom Leaflet map centred on the vehicle's coordinates so fleet managers see geographic context immediately instead of raw coordinates
- **Reverse geocoding** - converts GPS coordinates to a readable place name (e.g. "Grand Traverse County, Michigan, US") via Nominatim API; falls back gracefully to coordinates for water/ocean locations
- **Map view** - Leaflet + OpenStreetMap; markers for all vehicles with GPS; tooltip on hover; click marker opens detail panel; info bar shows vehicles without GPS
- **CSV export** - downloads the currently filtered set; cells correctly quoted; button disabled when no results
- **ZenduIT branding** - nav bar colour matched to ZenduIT's brand blue

### Key decisions
- **Angular signals + `computed()`** for all filter state - reactive, zero boilerplate, no NgRx needed at this scale
- **Pagination via `effect()`** - uses Angular's `effect()` to auto-reset to page 1 when filters change; pagination only renders when there is more than one page
- **Nominatim via Angular proxy** - reverse geocoding routed through `proxy.conf.json` so browser extensions cannot intercept the request; for production, swap to a paid geocoding provider
- **Leaflet marker icon fix** - Angular's asset pipeline mangles Leaflet's default PNG paths; resolved by pointing to the versioned unpkg CDN
- **`firstValueFrom` in tests** - Angular 21's stricter types reject the old Jasmine `done` callback pattern; converted to `async/await + firstValueFrom`

### Known limitations
- No URL-based filter state - can't deep-link to a filtered view
- No debounce on search - acceptable for in-memory filtering; required for server-side search
- No column sorting - filtering covers the same need for this scope
- Map tiles and reverse geocoding require network access
- Event taxonomy has no collision/accident event types - identified as a gap, documented as a future requirement
- Event timestamps in the static dataset do not always align with vehicle last-seen dates - dataset generation issue, not a code bug

### Next steps
1. Add column sorting (click table header)
2. Persist filter state in URL query params for deep-linking
3. Add collision/accident event types with automatic status change to `in_maintenance`
4. Wire up real-time event updates via WebSocket or SSE
5. Replace Nominatim with a paid geocoding provider for production SLA
6. Mobile-responsive layout
7. **Summary dashboard** - the dataset already has everything needed: total vehicles by status, safety events over time (e.g. harsh braking), vehicles without recent GPS pings, and geofence activity. A dashboard view would give fleet managers an at-a-glance overview before they drill into the list
8. **Login and authentication** - in production, fleet data is sensitive. Role-based access would ensure fleet managers only see their own accounts, and admins can see everything
9. **Database and server-side performance** - the current app filters 500 vehicles in memory which works fine. But if the fleet grows to millions of vehicles and events, all the data cannot be loaded into the browser at once. The solution would be to move the dataset into a SQL database, replace the static JSON with API endpoints, and push filtering, searching, and pagination to SQL queries on the server. This way the browser only receives the exact rows it needs, not everything
