// Writes the watch pages from every videos/<slug>/script.json and scenes.json, so they never drift from the captures:
// videos/index.html (the list) and videos/<slug>/index.html (one player each), with a 1200x630 share card per page.
// Usage (from this folder):  node studio/page.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ROOT = 'https://crm.agents.sovereignweb.site/factory/dinis-cruz/account-a/a.crm.studio/videos/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const card = (from, to) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', from, '-vf', 'scale=1200:675,crop=1200:630:0:0', '-q:v', '4', '-map_metadata', '-1', '-fflags', '+bitexact', to]);
const head = ({ title, desc, url, img, alt, depth }) => `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CRM agents">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${img}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${img}">
<link rel="canonical" href="${url}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'">
<link rel="stylesheet" href="${depth}player.css">
<link rel="stylesheet" href="${depth}brand.css">
<style>
:root{--bg:#fbfaf7;--fg:#1b1c1a;--muted:#5b6460;--line:#dcd9d0;--accent:#1f5446}
@media (prefers-color-scheme:dark){:root{--bg:#121513;--fg:#e9ece6;--muted:#a3aca7;--line:#303733;--accent:#7cc4ab}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,sans-serif}
main{max-width:60rem;margin:0 auto;padding:5vh 1rem 4rem}.kick{font:600 .78rem/1 system-ui;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.1;margin:.6rem 0 1rem}p,li{color:var(--muted)}a{color:var(--accent)}
.list{list-style:none;padding:0;display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))}
.list a{display:block;text-decoration:none;color:var(--fg);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.list img{display:block;width:100%;height:auto}.list span{display:block;padding:.6rem .8rem;font-weight:600}.list small{display:block;padding:0 .8rem .7rem;color:var(--muted)}
header.site{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem 1.2rem;max-width:60rem;margin:0 auto;padding:1rem 1rem 0}header.site .home{font-weight:700;color:var(--fg);text-decoration:none}header.site nav{display:flex;flex-wrap:wrap;gap:.3rem 1rem;margin-left:auto}header.site nav a{font-weight:600}
.learn{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.6rem;margin-top:1.4rem;padding:.8rem 1rem;border:1px solid var(--line);border-radius:10px}.learn a{font-weight:600}
details{margin-top:1.5rem}summary{cursor:pointer;min-height:44px;display:flex;align-items:center}footer{margin-top:3rem;font-size:.85rem;color:var(--muted)}
</style>
</head>`;
// The learning path (crm.dev.a's /learn/path.json on the tool site, crm.learn-path/1). Read at build time when it is
// published; otherwise the order crm.dev.a gave (24 Nov 2026, at Dinis's ask: "Once I finish this, I should go to the next one").
const TOOL = 'https://crm.tool.sovereignweb.site';
let PATH = [
  { title: 'The CRM in one page', url: `${TOOL}/learn/overview/` },
  { video: '01-what-it-is' }, { title: 'How to use the CRM', url: `${TOOL}/how-to/` },
  { video: '02-today-and-actions' }, { video: '03-follow-ups' }, { video: '04-import' },
  { title: 'Open the CRM', url: `${TOOL}/app/` }];
try { const j = JSON.parse(execFileSync('curl', ['-fsS', '--max-time', '10', `${TOOL}/learn/path.json`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  const steps = j.steps || j.path || j; if (Array.isArray(steps) && steps.length) PATH = steps.map((x) => { const m = String(x.url || x.href || '').match(/\/videos\/([0-9]{2}-[a-z0-9-]+)\/?$/);
    return m ? { video: m[1] } : { title: x.title, url: new URL(x.url || x.href, TOOL).href }; }); } catch { /* not published yet: keep the order above */ }
const NAV = `<header class="site"><a class="home" href="${TOOL}/">CRM</a><nav aria-label="CRM"><a href="${TOOL}/app/">Open the CRM</a><a href="${TOOL}/learn/">Learn</a><a href="${TOOL}/how-to/">How to</a><a href="ROOT_REL">Explainers</a></nav></header>`;
const vids = readdirSync('videos', { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`videos/${d.name}/scenes.json`)).map((d) => d.name).sort();
const items = [];
const titleOf = (x) => x.video ? JSON.parse(readFileSync(`videos/${x.video}/scenes.json`, 'utf8')).title : x.title;
const hrefOf = (x, fromVideo) => x.video ? (fromVideo ? `../${x.video}/` : `${x.video}/`) : x.url;
for (const slug of vids) {
  const k = PATH.findIndex((x) => x.video === slug), prevStep = k > 0 ? PATH[k - 1] : null, nextStep = k >= 0 && k < PATH.length - 1 ? PATH[k + 1] : null;
  const learn = k < 0 ? '' : `<nav class="learn learn-nav" aria-label="Learning path"><span>Step ${k + 1} of ${PATH.length}</span>${prevStep ? `<a href="${esc(hrefOf(prevStep, true))}">← ${esc(titleOf(prevStep))}</a>` : ''}${nextStep ? `<a href="${esc(hrefOf(nextStep, true))}">Next: ${esc(titleOf(nextStep))} →</a>` : ''}</nav>`;
  const d = JSON.parse(readFileSync(`videos/${slug}/scenes.json`, 'utf8'));
  const S = JSON.parse(readFileSync(`videos/${slug}/script.json`, 'utf8')); const first = d.scenes[S.share ?? -1]?.screen ? d.scenes[S.share] : d.scenes.find((s) => s.screen); card(`videos/${slug}/${first.screen}`, `videos/${slug}/share.jpg`);
  const desc = `${d.title}: a ${Math.round(d.seconds / 60) || 1}-minute explainer of the CRM, played in your browser from its demo mode (synthetic data only).`;
  items.push({ slug, d, desc });
  writeFileSync(`videos/${slug}/index.html`, `${head({ title: d.title, desc, url: `${ROOT}${slug}/`, img: `${ROOT}${slug}/share.jpg`, alt: `A screen of the CRM demo, from ${d.title}`, depth: '../' })}
<body>
${NAV.replace('ROOT_REL', '../')}
<main>
<div class="kick">CRM explainer · a.crm.studio</div>
<h1>${esc(d.title)}</h1>
<div class="player" data-src="scenes.json"${nextStep ? ` data-next-href="${esc(hrefOf(nextStep, true))}" data-next-title="${esc(titleOf(nextStep))}"` : ''}><p>This explainer plays in your browser with JavaScript. Its script is below.</p></div>
<details><summary>Script (the captions, in order)</summary>
<ol>
${d.scenes.map((s) => `<li>${esc(s.caption)}</li>`).join('\n')}
</ol>
<p>Source: <a href="script.json">script.json</a> (what the capture does) · <a href="scenes.json">scenes.json</a> (what the player shows) · <a href="manifest.json">manifest.json</a> (hashes).</p>
</details>
${learn}
<footer><a href="../">All CRM explainers</a> · made by a.crm.studio@SovereignWebsite.dinis · <a href="https://crm.tool.sovereignweb.site/how-to/">How to use the CRM</a></footer>
</main>
<script src="../player.js"></script>
</body>
</html>
`);
}
copyFileSync(`videos/${vids[0]}/share.jpg`, 'videos/share.jpg');
const desc = 'Short explainers of the CRM tool, played in your browser from its demo mode: synthetic data only.';
writeFileSync('videos/index.html', `${head({ title: 'CRM explainers', desc, url: ROOT, img: `${ROOT}share.jpg`, alt: 'A screen of the CRM demo', depth: '' })}
<body>
${NAV.replace('ROOT_REL', './')}
<main>
<div class="kick">a.crm.studio</div>
<h1>CRM explainers</h1>
<p>Short explainers of <a href="https://crm.tool.sovereignweb.site/">the CRM tool</a>, made from its demo mode: every company, person and email in them is made up. They are not video files: each page plays its scenes in your browser, with a synthetic presenter that reads the captions aloud in your browser's own voice. Each is captured by a script with headless Chromium, the clock pinned and only the CRM's own site reachable, so the same script on the same version gives the same screens. The written guide: <a href="https://crm.tool.sovereignweb.site/how-to/">How to use the CRM</a>.</p>
<ul class="list">
${items.map(({ slug, d }) => `<li><a href="${slug}/"><img src="${slug}/share.jpg" alt="" width="1200" height="630" loading="lazy"><span>${esc(d.title)}</span><small>${Math.round(d.seconds)} seconds · ${d.scenes.length} scenes · ${esc(d.site_version || '')}</small></a></li>`).join('\n')}
</ul>
<footer>Made by a.crm.studio@SovereignWebsite.dinis. <a href="../agent.json">Its state</a> · <a href="../now.md">what it is doing now</a>.</footer>
</main>
</body>
</html>
`);
console.log(`videos/: ${vids.length} explainer page(s)`);
