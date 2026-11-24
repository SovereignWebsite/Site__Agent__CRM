// Writes videos/index.html from every videos/<slug>/script.json and manifest.json, so the page never drifts from the captures.
// Usage (from this folder):  node studio/page.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const URL = 'https://crm.agents.sovereignweb.site/factory/dinis-cruz/account-a/a.crm.studio/videos/';
const DESC = 'Short explainer videos of the CRM tool, made by a.crm.studio from its demo mode: synthetic data only.';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const vids = readdirSync('videos', { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`videos/${d.name}/manifest.json`)).map((d) => d.name).sort();
const parts = vids.map((slug) => {
  const s = JSON.parse(readFileSync(`videos/${slug}/script.json`, 'utf8')), m = JSON.parse(readFileSync(`videos/${slug}/manifest.json`, 'utf8'));
  const lines = s.scenes.map((x) => `<li>${esc(x.caption)}</li>`).join('\n');
  return `<section id="${esc(slug)}">
<h2>${esc(s.title)}</h2>
<p class="meta">${Math.round(m.seconds)} seconds · ${m.scenes} scenes · captured from ${esc(m.site)} ${esc(m.site_version || '')} with the clock at ${esc(m.clock)}</p>
<video controls preload="metadata" poster="${esc(slug)}/poster.jpg" width="1280" height="720">
<source src="${esc(slug)}/video.mp4" type="video/mp4">
<track kind="captions" src="${esc(slug)}/captions.vtt" srclang="en" label="English" default>
</video>
<details><summary>Script (the captions, in order)</summary>
<ol>
${lines}
</ol>
<p>Source: <a href="${esc(slug)}/script.json">script.json</a> · <a href="${esc(slug)}/captions.vtt">captions.vtt</a> · <a href="${esc(slug)}/manifest.json">manifest.json</a> (hashes of every frame and of the video)</p>
</details>
</section>`; }).join('\n');
// The share card: the first video's poster, cut to 1200x630 (the size the share check asks for).
if (vids.length) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `videos/${vids[0]}/poster.jpg`, '-vf', 'scale=1200:675,crop=1200:630:0:0', '-q:v', '4', '-map_metadata', '-1', '-fflags', '+bitexact', 'videos/share.jpg']);
writeFileSync('videos/index.html', `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CRM explainer videos</title>
<meta name="description" content="${DESC}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CRM agents">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${URL}">
<meta property="og:title" content="CRM explainer videos">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${URL}share.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The first frame of the CRM explainer: the CRM, and its demo">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="CRM explainer videos">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${URL}share.jpg">
<link rel="canonical" href="${URL}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'">
<style>
:root{--bg:#f7f7f5;--fg:#1d1d1b;--muted:#5f5f5a;--line:#deded8;--accent:#0b5cad}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ededea;--muted:#a8a8a2;--line:#33332f;--accent:#7ab8ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 system-ui,sans-serif}
main{max-width:56rem;margin:0 auto;padding:6vh 1rem 4rem}.mark{font:600 .78rem/1 system-ui;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{font-size:clamp(1.9rem,6vw,2.6rem);line-height:1.1;margin:.6rem 0 1rem}p,li{color:var(--muted)}a{color:var(--accent)}
section{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--line)}video{width:100%;height:auto;border-radius:8px;background:#000}
.meta{font-size:.85rem}summary{cursor:pointer;margin-top:.6rem}footer{margin-top:3rem;font-size:.85rem;color:var(--muted)}
</style>
</head>
<body>
<main>
<div class="mark">a.crm.studio</div>
<h1>CRM explainer videos</h1>
<p>Short videos of <a href="https://crm.tool.sovereignweb.site/">the CRM tool</a>, made from its demo mode: every company, person and email in them is made up. Each is captured by a script with headless Chromium, the clock pinned and only the CRM's own site reachable, so the same script on the same site version gives the same video. The written guide: <a href="https://crm.tool.sovereignweb.site/how-to/">How to use the CRM</a>.</p>
${parts}
<footer>Made by a.crm.studio@SovereignWebsite.dinis. <a href="../agent.json">Its state</a> · <a href="../now.md">what it is doing now</a>.</footer>
</main>
</body>
</html>
`);
console.log(`videos/index.html: ${vids.length} video(s)`);
