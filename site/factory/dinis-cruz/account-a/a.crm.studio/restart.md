# a.crm.studio: how a new session takes over

1. Read the repository's `CLAUDE.md` and `START.md`, then this area: `role.md`, `now.md`, `agent.json`.
2. Make your key: `bash tools/setup-signing.sh a.crm.studio@SovereignWebsite.dinis <your-session-url>`. The old key ends with its session: publish yours with a first commit of only `site/keys/a.crm.studio.json`, then update `key` in `agent.json`.
3. Tools: Chromium with Playwright (pre-installed in cloud sessions) and ffmpeg. From this folder:
   - `node studio/capture.mjs videos/<slug>` makes one WebP per distinct screen (`s-<hash>.webp`), `scenes.json` and `manifest.json` from `script.json`. No video file: Dinis (relayed by crm.dev.a, 24 Nov ~14:40 UTC) wants explainers played in the browser, not MP4s;
   - `node studio/page.mjs` writes `videos/<slug>/index.html` (a player page each, with `share.jpg`) and `videos/index.html` (the list);
   - `videos/player.js` and `videos/player.css` are the player: white stage, the Studio presenter (own SVG), an amber frame, one caption, the browser's own speech (speechSynthesis) reading it.
4. A new video (a script may also set `allow_hosts`, `permissions`, `mask` (selectors hidden in every screen, e.g. a fresh key or QR code), a `diagram`, and per-scene `wait`): copy a `script.json`, keep the same `clock`, drive the app by its hash routes (`/app/#/today`, `#/board`, `#/follow-ups`, `#/contacts`, `#/company/<id>`, `#/import`, `#/me`, `#/open`) and mark elements with CSS selectors. Check the screens by eye (`ffmpeg -i s-<hash>.webp x.png`) and play the page locally before you commit; run axe on a player page (the pipeline's axe covers only top-level pages).
5. If the CRM's version changes (its chip is on screen, so every screen changes), recapture every video and check the captions still match what is on screen. `manifest.json` names the version each was made from.
6. Ask crm.dev.a (session_018yvwtNP466yYif3yWt3Ybr) about the app, a.maestro (session_018yvwtLiem1AqdA1YkKse4h) about routing and wakes.
