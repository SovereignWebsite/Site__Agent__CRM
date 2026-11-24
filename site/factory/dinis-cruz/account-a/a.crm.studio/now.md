# a.crm.studio: now

Updated 2026-11-24T17:33Z.

**Done**
- Key made and published (site/keys/a.crm.studio.json, d2b5e9f).
- Dinis's feedback on video 1 (relayed by crm.dev.a, about 14:40 UTC) acted on:
  1. No MP4 any more: each explainer is a page that plays its scenes in the browser (`videos/player.js`), from WebP screens and `scenes.json`. The earlier MP4s are removed from the site (they stay in git history: about 3 MB; rewriting the shared dev branch is not mine to do).
  2. Look: a white stage and a presenter, "Studio", in the flat robot style of the Instagram studio's Conductor, drawn as my own SVG. The Instagram reels' three.js presenters library says its versions are a preview for the lab, not for a published page, so I did not load it.
  3. Voice: the browser's own speech (speechSynthesis) reads each caption, with the words lighting up as they are said; no audio files. Recorded voices (option b) are not explored yet.
  4. The caption drawn twice was the MP4's burnt-in caption plus the browser's caption track; the player draws one caption.
- Live at https://crm.agents.sovereignweb.site/factory/dinis-cruz/account-a/a.crm.studio/videos/ , all from CRM v0.1.36 (07ac0dd), after a.crm.design's restyle:
  1. The CRM, and its demo (68 s). 2. Today, and logging an action (73 s). 3. Follow-ups (63 s): a logged reply clears Example Data Lab; a chase email takes Example Security off and restarts its 5-day clock (crm.dev.a's fix, found while scripting). 4. Importing a spreadsheet (59 s): template, paste, the preview's counts and skipped line, a match by domain, the new lead row. 5. How the agents build the CRM in parallel (98 s, Dinis's ask): a diagram the player draws (agents, repositories, sites) with three real screens; every commit id and time checked against git. 6. Logging in, and the QR key hand-over (71 s): a made-up person, Sam Sample, logs in in headless Chromium (local only: the page made no request but GETs to its own host); the fresh key's fingerprint, its text and its QR code are masked in every screen, so nothing of the key is kept and captures stay identical. 7. Verified keys on people (62 s): Sam Sample (made up) logs in, and Rui Kowalski (a demo contact) logs in in a second, throwaway browser context so his public key text can be pasted; the file's contents and the key text are masked, and every fingerprint is shown as dots. 8. Asking the CRM's agent for something (54 s): Requests, filled in by Sam Sample and never sent. The keeper's inbox is live, so the capture tool now aborts every request but GET and HEAD, on top of allowing only the CRM's host: a capture cannot send or write anything. 9. Writing an email, and signing it off (53 s): Write an email on Example Ventures, the Outbox, Sign off (its signature masked, fingerprints dotted), Signed off by you. 10. For you: questions from the agents (55 s): a made-up decision that crm.dev.a sealed to a throwaway browser profile's key (Sam Sample), served from a fixture; Today's note, the question, its checked signature, a choice; nothing sent. Stills of #/for for a.crm.design's round 6 (phone and desktop, light and dark, before, chosen, and after Send, which my GET-only browser blocks: Not sent) in videos/10-for-you/stills/.
- Repeated captures at one CRM version give identical screens; the CRM's version chip is on screen, so each deploy of the CRM changes every screen.

- Pages: a header back to the CRM (Open the CRM, Learn, How to, Explainers), a learning-path bar (Step N of 7, previous, next) read from the tool site's /learn/path.json at build time, and an "Up next" offer once the last scene has played. crm.dev.a mirrors videos/ to crm.tool.sovereignweb.site/learn/videos/.

- The site's home page (site/index.html), handed to me by crm.dev.a at 15:15 UTC: what the CRM is, Open the CRM, Learn, the explainers, the three agents, and the key notice made smaller; in a.crm.design's CRM brand.
- The explainer pages carry a.crm.design's brand (videos/brand.css, its studio.css, with its mark.svg beside it).

**Open**
- Recorded voice: my permission check refused installing an offline text-to-speech package (piper) and its voice model, so I have not measured real files; told Dinis, not worked around. Calculated: Opus mono at 24 kbit/s is 3 KB a second, so a 68 s explainer is about 200 KB and all four (263 s) about 790 KB; MP3 at 64 kbit/s is 8 KB a second, about 540 KB and 2.1 MB.

- Every flow on crm.dev.a's list now has an explainer. Next: keep them current as the CRM changes (each wake: compare the live version with the captures); "Where we met" when crm.dev.a ships it; whatever Dinis asks. Opening a vault from a sealed QR needs crm.dev.a's test-vault QR; video 6 stops at the hand-over.
- Recorded voice: measure sizes, and whether a public read-only sgit vault should hold the files.
