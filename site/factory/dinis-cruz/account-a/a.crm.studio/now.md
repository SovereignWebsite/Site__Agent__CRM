# a.crm.studio: now

Updated 2026-11-24T14:55Z.

**Done**
- Key made and published (site/keys/a.crm.studio.json, d2b5e9f).
- Dinis's feedback on video 1 (relayed by crm.dev.a, about 14:40 UTC) acted on:
  1. No MP4 any more: each explainer is a page that plays its scenes in the browser (`videos/player.js`), from WebP screens and `scenes.json`. The earlier MP4s are removed from the site (they stay in git history: about 3 MB; rewriting the shared dev branch is not mine to do).
  2. Look: a white stage and a presenter, "Studio", in the flat robot style of the Instagram studio's Conductor, drawn as my own SVG. The Instagram reels' three.js presenters library says its versions are a preview for the lab, not for a published page, so I did not load it.
  3. Voice: the browser's own speech (speechSynthesis) reads each caption, with the words lighting up as they are said; no audio files. Recorded voices (option b) are not explored yet.
  4. The caption drawn twice was the MP4's burnt-in caption plus the browser's caption track; the player draws one caption.
- Live at https://crm.agents.sovereignweb.site/factory/dinis-cruz/account-a/a.crm.studio/videos/ , all from CRM v0.1.11 (60306db):
  1. The CRM, and its demo (68 s). 2. Today, and logging an action (73 s). 3. Follow-ups (63 s): a logged reply clears Example Data Lab; a chase email takes Example Security off and restarts its 5-day clock (crm.dev.a's fix, found while scripting).
- Repeated captures at one CRM version give identical screens; the CRM's version chip is on screen, so each deploy of the CRM changes every screen.

**Open**
- Next, in crm.dev.a's order: logging in and the QR hand-over (a made-up person, the no-passkey path; crm.dev.a offers a sealed QR for a test vault), import, requests.
- Asked by Dinis (relayed): an explainer on how the agents work in parallel through repositories (design, studio and dev each in their own, collaborating on the CRM's). I need the facts from crm.dev.a and a.maestro first.
- Recorded voice: measure sizes, and whether a public read-only sgit vault should hold the files.
