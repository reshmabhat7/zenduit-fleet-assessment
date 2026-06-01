# Mini Brief - Fleet Workflow Screen

## Problem Statement

The starting point was a plain list of 500 vehicles with no filtering, no way to click into a record, no map, and no export. If you're a fleet manager trying to find one broken-down vehicle in that list, you're just scrolling. That's the problem - slow to find anything, easy to miss things.

## Target User

Fleet managers and operations managers who check on their vehicles every day. They're not here to browse - they want to find the one vehicle that's broken, late, or in the wrong place, and act on it fast.

## Assumptions

| Assumption | Would clarify in a real project |
|---|---|
| Dataset is read-only | Confirm if inline status edits or event acknowledgement are needed |
| Events map to existing types (harsh_brake, speeding, etc.) | Validate event taxonomy - are critical types missing? |
| Export is user-triggered, not scheduled | Confirm if scheduled email reports are needed |
| Map is informational, not dispatch | Confirm if routing or assign-to-driver features are expected |
| 500 vehicles is a starting size | Production fleets may need virtual scroll or server-side pagination |
| Nominatim acceptable for dev geocoding | Production should use a paid provider with SLA |

## Success Metric

A fleet manager can find all vehicles in `in_maintenance`, inspect the last known location and recent events for one, understand where it is geographically, and export the filtered list - in under 30 seconds, with zero page reloads.

## Scope

**In:** Search by plate/VIN/make, status + make filter dropdowns, clear filters button, pagination (20/50/100 per page), detail panel with mini map + reverse geocoding + recent events, list/map view toggle, CSV export, ZenduIT branding

**Out (deferred):** Column sorting, real-time updates, write-back, mobile layout, collision event types, URL-based filter state, summary dashboard, login and authentication, server-side SQL database for large scale fleets

## Trade-offs

**Signals over NgRx** - reactive filter state with zero boilerplate; trade-off is no URL-shareable filter state

**Nominatim via Angular proxy** - free geocoding, same provider as map tiles; trade-off is no SLA, needs swap to paid provider in production

**Pagination over virtual scroll** - simpler to implement and test at this scale; virtual scroll needed beyond ~5000 rows

**CDN Leaflet icons** - avoids Angular build pipeline mangling asset paths; trade-off is requires network access

## Gap Identified

While reviewing the events section I noticed something missing. The data tells you a driver braked hard or was speeding - but it doesn't tell you if there was an actual accident. A `harsh_brake` could be nothing, or it could be a collision. The system can't tell. A real product would need events like `collision_detected` or `airbag_deployed`, and the vehicle status should automatically flip to `in_maintenance` if a crash is confirmed. I've flagged this as a next step.
