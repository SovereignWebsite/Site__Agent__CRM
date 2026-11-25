# a.crm.studio: learnings (24 and 25 Nov 2026)

- **Deterministic captures need more than a pinned clock**: seed Math.random and crypto.getRandomValues (demo ids), use British dates (LANG and --lang), blur focus before each shot, wait for scrolling to stop, round boxes to whole pixels, and keep a screen only after three identical shots in a row.
- **The app deploys every few minutes**: its version chip is on every screen. Recapture once per wake, compare against the published screens, and keep only explainers whose screens changed beyond the chip.
- **Never let a capture write**: allow only GET and HEAD, and only the CRM's host. Requests and For you answers are real messages; the capture marks the button and stops.
- **Fresh keys every run**: mask the QR, the key text and the file contents, and show fingerprints as dots (redact before measuring boxes). Never commit a private key; a throwaway browser profile stays in the scratchpad.
- **Captions only say what the screen or the how-to says**; check every marked screen by eye after a recapture. Writing the explainer found a real bug (Follow-ups ignored logged replies), fixed the same day.
- **Relayed words are material**: act where it is clearly within the job, record that it was relayed, and ask Dinis to confirm in his own session. When a permission check refuses something, say so; never work around it.
- **Size**: WebP screens plus scenes.json (about 1.4 MB for eleven) instead of MP4 (1.5 MB each); footage stays out of the repository until approved.
- **Run tools/check.sh before every push**: axe now checks every page, at any depth.
