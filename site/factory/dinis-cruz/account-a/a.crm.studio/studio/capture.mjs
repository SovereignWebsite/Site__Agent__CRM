// a.crm.studio: deterministic captures of the CRM tool in demo mode, for the in-browser player (videos/player.js).
// Usage (from this folder):  node studio/capture.mjs videos/<slug>
// Reads videos/<slug>/script.json and writes, beside it: one WebP per distinct screen (s-<hash>.webp, no overlay),
// scenes.json (what the player animates: screen, marked box, caption, seconds) and manifest.json (hashes).
// No video file: the player draws the highlight, the caption and the presenter, and speaks the caption.
// Same script, same site version, same fonts: same screens. The clock is pinned, randomness is seeded and only the
// CRM's own host is reached (anything else is blocked), so nothing real can appear. Needs Playwright and ffmpeg.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const { chromium } = createRequire(import.meta.url)('playwright'); // CommonJS require finds a global install too

const dir = process.argv[2]; if (!dir) { console.error('usage: node studio/capture.mjs videos/<slug>'); process.exit(2); }
const S = JSON.parse(readFileSync(join(dir, 'script.json'), 'utf8'));
const W = 1280, H = 720;
const ALLOW = new Set(S.allow_hosts || ['crm.tool.sovereignweb.site']);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const tmp = mkdtempSync(join(tmpdir(), 'crm-studio-'));
for (const f of readdirSync(dir)) if (/^s-[0-9a-f]+\.webp$/.test(f)) rmSync(join(dir, f)); // old screens go; this run writes its own

const b = await chromium.launch({ args: ['--lang=en-GB'], env: { ...process.env, LANG: 'en_GB.UTF-8', LANGUAGE: 'en_GB' } }); // dates as 23/11/2026
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'en-GB', timezoneId: 'UTC', colorScheme: 'light', reducedMotion: 'reduce' });
// Only reads leave the browser: GETs to the allowed hosts. Any POST, PUT or DELETE (a request to the keeper, a
// vault write) is aborted, so a capture can never send or write anything, whatever a script clicks.
const SAFE = (r) => { const q = r.request(), u = new URL(q.url()); return (u.protocol === 'data:' || (ALLOW.has(u.host) && ['GET', 'HEAD'].includes(q.method()))) ? r.continue() : r.abort(); };
await ctx.route('**/*', SAFE);
if (S.permissions) await ctx.grantPermissions(S.permissions, { origin: S.base });
const p = await ctx.newPage();
await p.clock.setFixedTime(new Date(S.clock || '2026-11-24T10:00:00Z'));
// Seeded randomness, so ids the app makes for demo writes (a-xxxxxxxx) are the same in every capture.
await p.addInitScript((seed) => { let s = seed >>> 0; const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  Math.random = r; crypto.getRandomValues = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) u[i] = Math.floor(r() * 256); return a; };
  crypto.randomUUID = () => '00000000-0000-4000-8000-' + String(Math.floor(r() * 1e12)).padStart(12, '0'); }, S.seed ?? 42);

// The app may move focus after it renders (a caret blinks, a focus ring shows), so blur before every shot,
// and shoot until two shots in a row match, so a screen never catches the page mid-render.
// A script may mask what changes every run or should not be shown (a made-up person's fresh key, its QR code):
// the mask is a flat box drawn over those elements in the screenshot, so nothing of them is kept.
const MASK = S.mask || [];
// redact: inside these elements, every fingerprint-like run of hex (8 or more) is shown as dots in the screenshot,
// where a whole mask would hide too much (a badge that says "Verified key ✓ 1a2b3c4d" keeps its words).
const REDACT = S.redact || [];
const redact = async () => { if (REDACT.length) await p.evaluate((sels) => { for (const sel of sels) for (const el of document.querySelectorAll(sel)) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) n.nodeValue = n.nodeValue.replace(/(?=[0-9a-f]*[a-f])[0-9a-f]{8,}/g, '••••••••');
    if (el.title) el.title = el.title.replace(/(?=[0-9a-f]*[a-f])[0-9a-f]{8,}/g, '••••••••'); } }, REDACT); };
const still = async () => { await p.evaluate(() => document.activeElement?.blur?.()); await redact();
  return p.screenshot({ caret: 'hide', animations: 'disabled', mask: MASK.map((m) => p.locator(m)), maskColor: '#c9cec8' }); };
const settle = async (i) => { let shot = await still(), same = 0; for (let n = 0; ; n++) { await p.waitForTimeout(300); const next = await still(); if (next.equals(shot)) { if (++same === 2) return shot; } else same = 0; shot = next;
  if (n > 20) throw new Error(`scene ${i + 1}: the page never settled`); } };

let version = null; const screens = new Map(); const out = [];
for (const [i, sc] of S.scenes.entries()) {
  const scene = { caption: sc.caption, seconds: sc.seconds };
  if (sc.card) { out.push({ ...scene, card: sc.card }); continue; } // cards are drawn by the player, not captured
  if (sc.diagram) { out.push({ ...scene, diagram: sc.diagram }); continue; } // so are diagrams: the ids to light up
  for (const a of sc.do || []) {
    if (a.goto) await p.goto(/^https:/.test(a.goto) ? a.goto : S.base + a.goto, { waitUntil: 'networkidle' });
    if (a.hash) await p.evaluate((h) => { location.hash = h; }, a.hash); // in-page: keeps the demo's writes in this tab
    if (a.click) await p.locator(a.click).first().click();
    if (a.fill) await p.locator(a.fill[0]).first().fill(a.fill[1]);
    if (a.select) await p.locator(a.select[0]).first().selectOption(a.select[1]);
    if (a.wait) await p.locator(a.wait).first().waitFor({ timeout: 60000 }); // e.g. a key being made
    // keyfrom: a second made-up person logs in, in a separate browser context, and their PUBLIC key text (the
    // You page's #mykey, the same as their QR code) is pasted into a field here. That context is thrown away.
    if (a.keyfrom) { const other = await b.newContext({ locale: 'en-GB', timezoneId: 'UTC' });
      await other.route('**/*', SAFE);
      const q = await other.newPage(); await q.goto(`${S.base}/app/#/me`, { waitUntil: 'networkidle' });
      await q.fill('#li-name', a.keyfrom.name); await q.click('main button:has-text("Log in")'); await q.locator('#mykey').waitFor({ timeout: 60000 });
      const text = await q.inputValue('#mykey'); await other.close(); await p.locator(a.keyfrom.into).first().fill(text); }
    if (a.scroll) await p.locator(a.scroll).first().scrollIntoViewIfNeeded();
    if (a.top) await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
  }
  if (!version && p.url().startsWith(S.base)) version = await p.evaluate(() => (document.body.innerText.match(/v\d+\.\d+\.\d+ · [0-9a-f]{7} · \d{4}-\d\d-\d\d/) || [null])[0]);
  if (sc.mark) { const l = p.locator(sc.mark).first(); if (!sc.stay) await l.scrollIntoViewIfNeeded();
    if (sc.scroll_by) await p.evaluate((y) => window.scrollBy({ top: y, behavior: 'instant' }), sc.scroll_by);
    for (let last = -1, n = 0; n < 40; n++) { const y = await p.evaluate(() => window.scrollY); if (y === last) break; last = y; await p.waitForTimeout(100); }
    await redact(); // measure what will be shown
    const r = await l.boundingBox(); if (!r) throw new Error(`scene ${i + 1}: nothing to mark at ${sc.mark}`);
    // Whole pixels, kept inside the screen, so the box is the same in every capture.
    const x = Math.max(Math.round(r.x), 4), y = Math.max(Math.round(r.y), 4);
    scene.box = { x, y, w: Math.min(Math.round(r.x + r.width), W - 4) - x, h: Math.min(Math.round(r.y + r.height), H - 4) - y }; }
  const png = await settle(i); const id = sha(png).slice(0, 16);
  if (!screens.has(id)) { const f = join(tmp, `${id}.png`); writeFileSync(f, png);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-c:v', 'libwebp', '-lossless', '0', '-quality', '82', '-compression_level', '6', '-map_metadata', '-1', '-fflags', '+bitexact', join(dir, `s-${id}.webp`)]);
    screens.set(id, sha(readFileSync(join(dir, `s-${id}.webp`)))); }
  scene.screen = `s-${id}.webp`; out.push(scene);
}
await b.close(); rmSync(tmp, { recursive: true, force: true });

const data = { slug: S.slug, title: S.title, site: S.base, site_version: version, clock: S.clock, width: W, height: H,
  seconds: out.reduce((t, s) => t + s.seconds, 0), presenter: S.presenter || 'Studio', ...(S.diagram ? { diagram: S.diagram } : {}), scenes: out };
writeFileSync(join(dir, 'scenes.json'), JSON.stringify(data, null, 1) + '\n');
writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ slug: S.slug, site_version: version, clock: S.clock, scenes: out.length,
  screens: Object.fromEntries([...screens].map(([id, h]) => [`s-${id}.webp`, h])), scenes_json_sha256: sha(readFileSync(join(dir, 'scenes.json'))),
  made_by: 'a.crm.studio@SovereignWebsite.dinis', tool: 'studio/capture.mjs' }, null, 2) + '\n');
console.log(`${S.slug}: ${out.length} scenes, ${screens.size} screens, ${data.seconds} s, site ${version}`);
