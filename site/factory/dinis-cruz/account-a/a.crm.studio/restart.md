# a.crm.studio: how a new session takes over

## Taking over (25 Nov 2026: moving to account B as cl-2.crm.studio@SovereignWebsite.dinis)
- Repositories to attach: SovereignWebsite/Site__Agent__CRM (this site; push to dev). Read-only, for facts: SovereignWebsite/Site__Tool__CRM, AgentiCCells/AgentiCCells__Cell__Email (branch work/crm.dev.a), SovereignWebsite/Site__Agent__Design.
- Wake: the old one is "a.crm.studio wake" (trig_01W1DzpdeT36c1wYEao9Zasd, every 2 h at :47 UTC, set by a.maestro); account B's maestro sets the new one. At a wake: pull, read messages from crm.dev.a, recapture only what the app changed, publish, keep this area current; nothing new: one line, push nothing.
- First steps: make and publish your own key (step 2 below); if your name differs, decide with your maestro whether to keep this area or start site/factory/dinis-cruz/account-b/<you>/ and point this one to it; tell crm.dev.a (it mirrors the videos) and a.crm.design your session id.
- Learnings: [learnings.md](learnings.md).


1. Read the repository's `CLAUDE.md` and `START.md`, then this area: `role.md`, `now.md`, `agent.json`.
2. Make your key: `bash tools/setup-signing.sh a.crm.studio@SovereignWebsite.dinis <your-session-url>`. The old key ends with its session: publish yours with a first commit of only `site/keys/a.crm.studio.json`, then update `key` in `agent.json`.
3. Tools: Chromium with Playwright (pre-installed in cloud sessions) and ffmpeg. From this folder:
   - `node studio/capture.mjs videos/<slug>` makes one WebP per distinct screen (`s-<hash>.webp`), `scenes.json` and `manifest.json` from `script.json`. No video file: Dinis (relayed by crm.dev.a, 24 Nov ~14:40 UTC) wants explainers played in the browser, not MP4s;
   - `node studio/page.mjs` writes `videos/<slug>/index.html` (a player page each, with `share.jpg`) and `videos/index.html` (the list);
   - `videos/player.js` and `videos/player.css` are the player: white stage, the Studio presenter (own SVG), an amber frame, one caption, the browser's own speech (speechSynthesis) reading it.
4. A new video (a script may also set `allow_hosts`, `permissions`, `mask` (selectors hidden in every screen, e.g. a fresh key or QR code), a `diagram`, and per-scene `wait`): copy a `script.json`, keep the same `clock`, drive the app by its hash routes (`/app/#/today`, `#/board`, `#/follow-ups`, `#/contacts`, `#/company/<id>`, `#/import`, `#/me`, `#/open`) and mark elements with CSS selectors. Check the screens by eye (`ffmpeg -i s-<hash>.webp x.png`) and play the page locally before you commit; run axe on a player page (the pipeline's axe covers only top-level pages).
5. If the CRM's version changes (its chip is on screen, so every screen changes), recapture every video and check the captions still match what is on screen. `manifest.json` names the version each was made from.
6. Ask crm.dev.a (session_018yvwtNP466yYif3yWt3Ybr) about the app, a.maestro (session_018yvwtLiem1AqdA1YkKse4h) about routing and wakes.
7. Video 10 (For you) needs the browser profile whose key its decision is sealed to. That profile lived in the old session's scratchpad and is gone with it: make a new profile (log in as Sam Sample, read #mykey), send the PUBLIC key text to crm.dev.a to seal a new made-up decision, save it as videos/10-for-you/for-you.fixture.json (and the route in script.json, which names the key's fingerprint), and run with STUDIO_PROFILE=<profile folder>. The current decision expires on 14 Dec 2026 in any case.
8. Before every push, run `bash tools/check.sh` from the repository root: the deploy's own checks (build, link previews, quality, HTML validity, axe on every page).
