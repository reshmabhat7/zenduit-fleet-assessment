# How I Used Claude

I used Claude as a fast pair-programmer for scaffolding, test setup, and SCSS, then reviewed and tested everything myself before submitting. The product decisions and the bug catches below were mine; Claude was the tool that helped me move quickly.

## What it helped with

- Generated the initial TypeScript models, service methods, and component stubs.
- Set up the Leaflet maps (the `AfterViewInit` + `ViewChild` pattern, plus marker icon and memory cleanup) for both the map view and the mini map in the detail panel.
- Drafted the reverse-geocoding call and the Angular proxy config that routes Nominatim through the dev server.
- Wrote the pagination signals and the CSV cell-escaping logic for commas, quotes, and newlines.
- Generated the test suite around a vehicle factory and a stubbed service.

## What I verified manually

- Ran `npm test` (26 passing) and walked the full QA checklist in the browser before calling anything done.
- Checked the downloaded CSV in a spreadsheet — headers, values, and quoted commas all match the screen.
- Confirmed the detail panel opens from both list rows and map markers, and that keyboard Tab + Enter works.
- Confirmed reverse geocoding returns a readable place name on land and falls back to coordinates over water.

## What I drove or corrected

- Raw GPS coordinates mean nothing to a fleet manager, so I added the mini map and reverse geocoding to give geographic context. I also matched the nav bar to ZenduIT's brand blue.
- I spotted that the event taxonomy has no collision/accident type — a `harsh_brake` can't tell you if there was an actual crash — and flagged it as a gap with a suggested next step.
- Bugs I caught while testing and had fixed: the detail panel opened *behind* the Leaflet map (z-index too low), pagination was showing in map view where it makes no sense, and the mini map's zoom was so tight it only showed ocean.
- One thing I rejected: the generated tests used the old Jasmine `done` callback, which fails to compile under Angular 21's stricter types. I rewrote them with `async/await` + `firstValueFrom`, which is the correct modern approach.
