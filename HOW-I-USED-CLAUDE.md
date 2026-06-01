# How I Used Claude

I used Claude to help me build faster - scaffolding, test structure, debugging ideas, and documentation. But I didn't just accept what it gave me. I reviewed every file, tested the app myself in the browser, caught real bugs, and made corrections before submitting. Beyond that, I analysed the data and the user experience myself - I noticed that raw GPS coordinates are meaningless to a fleet manager and suggested adding a mini map and reverse geocoding. I spotted that the event taxonomy had no collision or accident data and flagged it as a gap. I identified that pagination would be needed for production scale and asked for it to be added. I matched the app's branding to ZenduIT's actual website. These weren't suggestions from Claude - they came from me thinking about what a fleet manager actually needs, not just what the brief asked for.

---

## What Claude helped with

- Generated initial TypeScript models, service methods, and component stubs as a starting skeleton
- Suggested the `AfterViewInit` + `ViewChild` pattern for initialising Leaflet maps after Angular renders the container div
- Implemented the mini map inside the detail panel including lifecycle hook setup and memory cleanup
- Drafted the reverse geocoding method and Angular proxy configuration to route Nominatim requests through the dev server
- Implemented pagination computed signals and the `effect()` that auto-resets to page 1 when filters change
- Drafted the CSV export cell-escaping logic for commas, quotes, and newlines
- Generated the test suite with a vehicle factory function and stubbed service covering filter combinations and panel state
- Wrote the SCSS for the detail panel, status badges, pagination controls, and nav bar

## What I verified manually

- Ran `npm test` and confirmed all 26 tests pass before considering anything done
- Walked through every item in the QA checklist in the browser - filters, detail panel, map markers, CSV download, pagination
- Confirmed the mini map shows regional context at the correct zoom level - not just a blue ocean screen
- Confirmed pagination hides in map view and only appears in list view
- Verified reverse geocoding returns a readable place name for land vehicles and falls back to coordinates for ocean locations
- Checked the downloaded CSV in a spreadsheet - headers correct, values match screen, commas properly quoted
- Verified the detail panel opens correctly from both list rows and map markers
- Tested keyboard navigation - Tab to a row, Enter opens the detail panel

## What I identified and added myself (not in the original brief)

- Noticed raw GPS coordinates are meaningless to a fleet manager - directed the mini map feature
- Asked whether coordinates could show a readable place name - led to reverse geocoding
- Identified the initial zoom level was too close showing only ocean - directed fix to zoom level 8
- Identified that production fleets can have thousands of vehicles - asked for pagination as forward-planning
- Noticed pagination was incorrectly appearing under map view - caught this UX bug and directed the fix
- Checked ZenduIT's actual website and matched the nav bar to their brand blue
- Identified the event taxonomy has no collision or accident events - flagged as a future requirement
- Noticed event timestamps don't always match vehicle last-seen dates - identified as a data quality issue, not a code bug

## One thing I rejected or corrected

- The generated tests used an old Jasmine `done` callback pattern that throws a TypeScript error in Angular 21. I caught the compile error, understood why it was happening, and rewrote both tests using `async/await` with `firstValueFrom()` which is the right way to do it in modern Angular
- The mini map was set to zoom level 13 - way too close, just showing blue ocean. I spotted this when testing, questioned it, and got it fixed to zoom level 8 so you can actually see where the vehicle is
- Pagination was showing under the map view which made no sense - the map shows everything at once. I caught this and got it fixed to only show in list view
- The detail panel was opening behind the Leaflet map because the z-index was too low (100). I caught this during testing and got it bumped to 1000
