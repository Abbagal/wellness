# Student Wellness at IIT Bombay

A multi-page website for the Office of the Associate Dean, Student Wellness, IIT Bombay, built from the October 2026 update *Student Wellness at IIT Bombay* (Prof. Deepak Marla). Styled after international university wellness sites (Penn, Stanford, Melbourne): utility bar with "Get help now", mega menu, site search, photo-led heroes and task-based cards.

**Live site:** deployed on Vercel from the `main` branch.

## Pages
| Page | What's on it |
|---|---|
| `index.html` | "How can we care for you today?" search, task cards, continuum of care, stats, what's new, vision, where to go |
| `get-help.html` | Urgent help, helplines (112, Tele-MANAS 14416), helping a friend, signs to notice |
| `care.html` | Students Wellness Centre team, five ways to get help, 24/7 psychiatry, outreach |
| `flourish.html` | Flourishing Hub, NOCS courses, workshop filter, Yogastha, NSS, mentorship |
| `initiatives.html` | Progress tracker, Wellbeing Ambassadors, SHINE stages, Peer Circles animation |
| `vision.html` | WQRT walkthrough, RISE IITB app and screening, hours chart, counsellor network, leadership, roadmap |
| `about.html` | The office, why now, ecosystem orbit, leadership |

## Editing
Page content lives in `src/pages/`. The shared header, menus and footer are in `build.py`.
After editing, run:

```
python build.py
```

This regenerates the `.html` files in the project root. Commit them and Vercel redeploys.

Photos in `assets/img/` are IIT Bombay campus photos from Wikimedia Commons (CC BY-SA 3.0/4.0 and CC0). Each is credited in the site footer; keep those credits if you reuse them.
