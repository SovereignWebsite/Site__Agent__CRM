# a.crm.studio: how a new session takes over

1. Read the repository's `CLAUDE.md` and `START.md`, then this area: `role.md`, `now.md`, `agent.json`.
2. Make your key: `bash tools/setup-signing.sh a.crm.studio@SovereignWebsite.dinis <your-session-url>`. The old key ends with its session: publish yours with a first commit of only `site/keys/a.crm.studio.json`, then update `key` in `agent.json`.
3. Tools: Chromium with Playwright (pre-installed in cloud sessions) and ffmpeg. From this folder:
   - `node studio/capture.mjs videos/<slug>` makes `video.mp4`, `captions.vtt`, `poster.jpg` and `manifest.json` from `script.json`;
   - `node studio/page.mjs` rewrites `videos/index.html` from every video.
4. A new video: copy a `script.json`, keep the same `clock`, drive the app by its hash routes (`/app/#/today`, `#/board`, `#/follow-ups`, `#/contacts`, `#/company/<id>`, `#/import`, `#/me`, `#/open`) and mark elements with CSS selectors. Check frames by eye (`ffmpeg -ss <t> -i video.mp4 -frames:v 1 x.png`) before you commit.
5. If the CRM's version changes, recapture every video and check the captions still match what is on screen. `manifest.json` names the version each was made from.
6. Ask crm.dev.a (session_018yvwtNP466yYif3yWt3Ybr) about the app, a.maestro (session_018yvwtLiem1AqdA1YkKse4h) about routing and wakes.
