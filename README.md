# Wellness at IIT Bombay

A static website built from the web team brief, split into pages. No framework, no database, no build step.

- `index.html`: Home, a short summary (hero, Wellness at a Glance, Our Work, the Director's and Associate Dean's messages, Our Team, links to every page)
- `about.html`: Our Work and the leadership messages
- `initiatives.html`: Our Initiatives
- `get-help.html`: How to Get Help
- `people.html`: core team, Advisory Board and Student Body (Wellbeing Ambassadors)
- `reports.html`: reports and Activity Highlights
- `styles.css`: all styling
- `script.js`: page behaviour and all editable data
- `images/`: photographs

- `site-chrome.js`: the header, footer and "Get help now" panel, shared by every page, including the Initiatives and Get Help dropdown menus. Change them here once.

## Updating numbers and links
Edit the data at the top of `script.js`. A value of `null` shows as a placeholder such as `[XX]`. Do not publish with placeholders.

- `WELLNESS_DATA`: counts, helplines, booking links and the "as of" month
- `REPORTS`: reports and calendars, added in one place
- `ADVISORY_BOARD`: names, designations, affiliations and photographs
- `HIGHLIGHTS`: Activity Highlights captions and photographs
- `STUDENT_BODY`: Institute, Hostel and Department Wellbeing Ambassadors
- `CALL_LIST`: the tap-to-dial numbers in the help panel and on the Get Help page
- `SERVICES`: hours, how to reach and location for each service on the Get Help page

## Before launch
Confirm the WRT number, email and booking link. Block 9 (Voices) stays out until real, consented, anonymised testimonials are supplied.

The hero is a Wikimedia Commons photo (CC BY-SA 4.0), credited in the footer. Keep the credit until it is replaced with the Institute's own photo.
