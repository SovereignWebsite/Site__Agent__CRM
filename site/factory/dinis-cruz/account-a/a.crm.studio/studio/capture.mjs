// a.crm.studio: deterministic explainer captures of the CRM tool, demo mode only.
// Usage (from this folder's parent):  node studio/capture.mjs videos/<slug>
// Reads videos/<slug>/script.json and writes, beside it: video.mp4, captions.vtt, poster.jpg, manifest.json.
// Same script, same site version, same fonts: same frames. The clock is pinned and only the CRM's own host is
// reached (anything else is blocked), so nothing real can appear. Needs Playwright (Chromium) and ffmpeg.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // CommonJS require finds a global install too
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dir = process.argv[2]; if (!dir) { console.error('usage: node studio/capture.mjs videos/<slug>'); process.exit(2); }
const S = JSON.parse(readFileSync(join(dir, 'script.json'), 'utf8'));
const W = 1280, H = 720, FADE = 0.4, FPS = 25;
const frames = join(dir, '.frames'); rmSync(frames, { recursive: true, force: true }); mkdirSync(frames, { recursive: true });
const ALLOW = new Set(S.allow_hosts || ['crm.tool.sovereignweb.site']);

const OVERLAY = ({ caption, step, total, title, box }) => {
  document.getElementById('__studio')?.remove();
  const root = document.createElement('div'); root.id = '__studio';
  root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;font:500 25px/1.35 system-ui,sans-serif';
  if (box) { const b = document.createElement('div');
    b.style.cssText = `position:fixed;left:${box.x - 6}px;top:${box.y - 6}px;width:${box.w + 12}px;height:${box.h + 12}px;border:4px solid #e0a100;border-radius:10px;box-shadow:0 0 0 9999px rgba(0,0,0,.28)`;
    root.append(b); }
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;padding:18px 40px 22px;background:rgba(18,20,18,.92);color:#fff;display:flex;gap:24px;align-items:center';
  const chip = document.createElement('div'); chip.textContent = `${step} / ${total}`;
  chip.style.cssText = 'flex:none;font:600 15px/1 ui-monospace,monospace;color:#e0a100;border:1px solid #e0a100;border-radius:999px;padding:6px 10px';
  const txt = document.createElement('div'); txt.textContent = caption;
  bar.append(chip, txt); root.append(bar);
  if (title) { const t = document.createElement('div'); t.textContent = title;
    t.style.cssText = 'flex:none;margin-left:auto;font:600 14px/1.2 system-ui;color:#a8a69e;max-width:180px;text-align:right';
    bar.append(t); }
  document.body.append(root);
};

const card = (h1, sub, foot) => `<!doctype html><html lang="en-GB"><meta charset="utf-8"><body style="margin:0;height:100vh;display:grid;place-items:center;background:#141513;color:#ecebe6;font-family:system-ui,sans-serif">
<div style="max-width:960px;padding:0 40px"><div style="font:600 18px/1 system-ui;letter-spacing:.14em;text-transform:uppercase;color:#7fc3a0">CRM · explainer</div>
<h1 style="font-size:60px;line-height:1.1;margin:18px 0">${h1}</h1><p style="font-size:28px;line-height:1.4;color:#a8a69e;margin:0">${sub}</p>
<p style="font-size:18px;color:#a8a69e;margin-top:48px">${foot || ''}</p></div></body></html>`;

const b = await chromium.launch({ args: ['--lang=en-GB'], env: { ...process.env, LANG: 'en_GB.UTF-8', LANGUAGE: 'en_GB' } }); // dates as 23/11/2026, not 11/23/2026
const ctx = await b.newContext({ // reducedMotion also stops smooth scrolling in most pages
  viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'en-GB', timezoneId: 'UTC', colorScheme: 'light', reducedMotion: 'reduce' });
await ctx.route('**/*', (r) => { const u = new URL(r.request().url()); return (u.protocol === 'data:' || ALLOW.has(u.host)) ? r.continue() : r.abort(); });
const p = await ctx.newPage();
await p.clock.setFixedTime(new Date(S.clock || '2026-11-24T10:00:00Z'));
// Seeded randomness, so ids the app makes for demo writes (a-xxxxxxxx) are the same in every capture.
await p.addInitScript((seed) => { let s = seed >>> 0; const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  Math.random = r; crypto.getRandomValues = (a) => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); for (let i = 0; i < u.length; i++) u[i] = Math.floor(r() * 256); return a; };
  crypto.randomUUID = () => '00000000-0000-4000-8000-' + String(Math.floor(r() * 1e12)).padStart(12, '0'); }, S.seed ?? 42);
let version = null;
const total = S.scenes.length;
for (const [i, sc] of S.scenes.entries()) {
  if (sc.card) { await p.goto('about:blank'); } // a card is drawn on a blank page, away from the site's own CSP
  if (sc.card) await p.setContent(card(sc.card.title, sc.card.sub, sc.card.foot));
  for (const a of sc.do || []) {
    if (a.goto) { await p.goto(S.base + a.goto, { waitUntil: 'networkidle' }); }
    if (a.hash) await p.evaluate((h) => { location.hash = h; }, a.hash); // in-page: keeps the demo's writes in this tab
    if (a.click) await p.locator(a.click).first().click();
    if (a.fill) await p.locator(a.fill[0]).first().fill(a.fill[1]);
    if (a.select) await p.locator(a.select[0]).first().selectOption(a.select[1]);
    if (a.scroll) await p.locator(a.scroll).first().scrollIntoViewIfNeeded();
    if (a.top) await p.evaluate(() => window.scrollTo(0, 0));
    await p.evaluate(() => document.activeElement?.blur?.()); // no caret or selection in a frame
    await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
  }
  if (!sc.card && !version) version = await p.evaluate(() => (document.body.innerText.match(/v\d+\.\d+\.\d+ · [0-9a-f]{7} · \d{4}-\d\d-\d\d/) || [null])[0]);
  let box = null;
  if (sc.mark) { const l = p.locator(sc.mark).first(); if (!sc.stay) await l.scrollIntoViewIfNeeded();
    if (sc.scroll_by) await p.evaluate((y) => window.scrollBy({ top: y, behavior: 'instant' }), sc.scroll_by);
    // Wait until scrolling has stopped, then mark whole pixels, so the frame is the same in every capture.
    for (let last = -1, n = 0; n < 40; n++) { const y = await p.evaluate(() => window.scrollY); if (y === last) break; last = y; await p.waitForTimeout(100); }
    const r0 = await l.boundingBox(); const r = r0 && { x: Math.round(r0.x), y: Math.round(r0.y), width: Math.round(r0.width), height: Math.round(r0.height) }; if (!r) throw new Error(`scene ${i + 1}: nothing to mark at ${sc.mark}`);
    // A mark taller than the view is cut at the caption bar, so its frame stays visible.
    const y = Math.max(r.y, 8), bottom = Math.min(r.y + r.height, H - 130);
    box = { x: r.x, y, w: r.width, h: bottom - y }; }
  await p.evaluate(OVERLAY, { caption: sc.caption, step: i + 1, total, title: sc.card ? null : S.title, box });
  // Settle: shoot until two shots in a row match, so a frame never catches the page mid-render.
  // The app may move focus after it renders (a caret blinks, a focus ring shows), so blur before every shot.
  const still = async () => { await p.evaluate(() => document.activeElement?.blur?.()); return p.screenshot({ caret: 'hide', animations: 'disabled' }); };
  let shot = await still(), tries = 0;
  for (;;) { await p.waitForTimeout(300); const next = await still(); if (next.equals(shot)) break; shot = next;
    if (++tries > 20) throw new Error(`scene ${i + 1}: the page never settled`); }
  writeFileSync(join(frames, `${String(i).padStart(3, '0')}.png`), shot);
  if (i === (S.poster ?? 0)) await p.screenshot({ path: join(dir, 'poster.jpg'), type: 'jpeg', quality: 80 });
}
await b.close();

// Captions (WebVTT) and the video: each scene holds for its seconds, with a short cross-fade between scenes.
const dur = S.scenes.map((s) => s.seconds);
const t = (x) => { const ms = Math.round(x * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
let at = 0; const cues = S.scenes.map((s, i) => { const start = at, end = at + dur[i] - (i < total - 1 ? FADE : 0); at = end; return `${i + 1}\n${t(start)} --> ${t(end)}\n${s.caption}\n`; });
writeFileSync(join(dir, 'captions.vtt'), 'WEBVTT\n\n' + cues.join('\n'));
const args = ['-y', '-loglevel', 'error'];
S.scenes.forEach((_, i) => args.push('-loop', '1', '-framerate', String(FPS), '-t', String(dur[i]), '-i', join(frames, `${String(i).padStart(3, '0')}.png`)));
let f = '', last = '[0:v]', off = 0;
for (let i = 1; i < total; i++) { off += dur[i - 1] - FADE; const out = i === total - 1 ? '[v]' : `[x${i}]`; f += `${last}[${i}:v]xfade=transition=fade:duration=${FADE}:offset=${off.toFixed(3)}${out};`; last = out; }
f += total > 1 ? '[v]format=yuv420p[o]' : '[0:v]format=yuv420p[o]';
args.push('-filter_complex', f, '-map', '[o]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-tune', 'stillimage', '-r', String(FPS), '-threads', '1',
  '-movflags', '+faststart', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:v', '+bitexact', join(dir, 'video.mp4'));
execFileSync('ffmpeg', args, { stdio: 'inherit' });
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const frameSha = S.scenes.map((_, i) => sha(join(frames, `${String(i).padStart(3, '0')}.png`)));
writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ slug: S.slug, title: S.title, site: S.base, site_version: version, clock: S.clock,
  seconds: +at.toFixed(3), scenes: total, frames_sha256: frameSha, video_sha256: sha(join(dir, 'video.mp4')),
  made_by: 'a.crm.studio@SovereignWebsite.dinis', tool: 'studio/capture.mjs' }, null, 2) + '\n');
if (!process.env.KEEP_FRAMES) rmSync(frames, { recursive: true, force: true });
console.log(`${S.slug}: ${total} scenes, ${at.toFixed(1)} s, site ${version}`);
