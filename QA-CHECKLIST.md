# Self-QA Checklist

## How to run

```bash
nvm use 22        # Angular 21 requires Node ≥ 20.19 - v22.20.0 LTS confirmed working
npm install
npm start         # http://localhost:4200
npm test          # 26 unit tests
```

---

## Automated tests (26 passing)

| Test file | What it guards |
|---|---|
| `vehicle.service.spec.ts` | Service instantiates; plate whitespace trimmed; events endpoint hit |
| `vehicle-list.spec.ts` | Component creates; vehicles load; all filter combinations; makes dropdown; view toggle; detail panel open/close |

---

## Manual QA walkthrough

### Happy paths

| # | Step | Expected | Verified |
|---|---|---|---|
| 1 | Load `http://localhost:4200` | Nav bar shows ZenduIT blue, table loads all vehicles, count reads "500 of 500" | ✅ |
| 2 | Type "ford" in search box | Table filters live, count updates | ✅ |
| 3 | Select "In Maintenance" in Status dropdown | Only `in_maintenance` vehicles shown | ✅ |
| 4 | Select a Make in the Make dropdown | Further narrows results | ✅ |
| 5 | Apply any filter - check for Clear filters button | Red "✕ Clear filters" button appears next to dropdowns | ✅ |
| 5b | Click Clear filters button | All filters reset, all 500 vehicles return, button disappears | ✅ |
| 6 | Check pagination bar | Shows "Showing 1–50 of 500 vehicles · Page 1 of 10 · Next →" | ✅ |
| 7 | Click Next → | Page 2 loads, count shows "Showing 51–100 of 500" | ✅ |
| 8 | Change page size to 100 | Table shows 100 rows, pagination updates | ✅ |
| 9 | Apply filter while on page 3 | Resets to page 1 automatically | ✅ |
| 10 | Click any table row | Detail panel slides in from right | ✅ |
| 11 | Detail panel - check content | Plate, make/model/year, status badge, VIN, device ID, account | ✅ |
| 12 | Detail panel - location section | Shows "Looking up address…" then readable place name | ✅ |
| 13 | Detail panel - mini map | Regional zoom map renders with marker at vehicle location | ✅ |
| 14 | Detail panel - recent events | Event type badges and relative timestamps shown | ✅ |
| 15 | Click ✕ on detail panel | Panel closes | ✅ |
| 16 | Click dark backdrop | Panel closes | ✅ |
| 17 | Click "Map" toggle | Leaflet map renders with markers, pagination hidden | ✅ |
| 18 | Hover a map marker | Tooltip shows plate, make/model, status | ✅ |
| 19 | Click a map marker | Same detail panel opens on top of map | ✅ |
| 20 | Click "List" toggle | Returns to table, pagination reappears | ✅ |
| 21 | Apply filter, click "Export CSV" | File downloads with only filtered rows | ✅ |
| 22 | Open CSV | Headers correct, values match screen | ✅ |

### Edge cases

| # | Scenario | Expected | Verified |
|---|---|---|---|
| 23 | Search returns 0 results | "No vehicles match" shown; Export CSV disabled; pagination hidden | ✅ |
| 24 | Filter returns less than one page | Pagination bar hidden entirely | ✅ |
| 25 | Vehicle with `null` last_known_location | Detail panel shows "No location data available"; mini map not rendered | ✅ |
| 26 | Vehicle with GPS in ocean/water | Reverse geocoding falls back to raw coordinates silently | ✅ |
| 27 | Vehicle with no events | Detail panel shows "No recent events" | ✅ |
| 28 | Map view with active filter | Info bar shows correct "X on map · Y without GPS"; pagination not visible | ✅ |
| 29 | Plate with leading/trailing whitespace in raw data | Whitespace trimmed - confirmed by unit test | ✅ |
| 30 | CSV cell containing a comma | Cell is double-quoted in output | ✅ |
| 31 | Keyboard navigation - Tab to row, press Enter | Detail panel opens | ✅ |
| 32 | Combine all three filters simultaneously | All three predicates applied correctly | ✅ |

### Failure modes

| # | Scenario | Expected | Verified |
|---|---|---|---|
| 33 | Dataset JSON fails to load | Loading clears, table shows empty state, no infinite spinner | ✅ |
| 34 | Nominatim API unavailable | Location section shows raw coordinates as fallback | ✅ |
| 35 | Map tiles offline | Map renders grey tiles but markers still appear and are clickable | ✅ |
| 36 | Rapid filter changes | No stale renders - computed signals always consistent | ✅ |
| 37 | Detail panel opened from map, then map closed | Panel stays open correctly | ✅ |

---

## Rollout risk & observability

**Risk level:** Low. Read-only frontend change over a static dataset. No API mutations, no auth changes, no schema migrations.

**External dependency added:** Nominatim reverse geocoding API (free, OpenStreetMap). Routed through Angular dev proxy to avoid browser extension interference. For production, proxy through the app server or replace with a paid geocoding provider.

**How I would know it worked in production:**
- Session duration on the fleet list screen increases - users finding the right vehicle faster
- Support tickets about "can't find vehicle" or "had to scroll through everything" decrease
- CSV export events logged - an uptick confirms the export feature is being used
- Reverse geocoding success rate monitored - if it falls below threshold, alert and fallback to coordinates

**Rollout approach:**
- Feature flag the map view toggle if Leaflet bundle size is a concern on slower connections
- Monitor JS error rate on map route - Leaflet initialisation failures surface here
- Monitor Nominatim API response time - add timeout so slow geocoding doesn't block the panel from rendering

---

## Known data quality issue

Event timestamps in the static dataset do not always align with vehicle last-seen dates. This is a dataset generation issue - not a code bug. In production, events are generated live by the GPS device and would always be chronologically consistent with vehicle location data.
