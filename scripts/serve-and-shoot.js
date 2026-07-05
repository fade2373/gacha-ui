#!/usr/bin/env node
/**
 * gacha-ui · serve-and-shoot
 * Screenshots every *.html in a directory and serves them SIDE-BY-SIDE for browsing.
 *
 *   node serve-and-shoot.js <dir> [port=auto] [width=1280]
 *
 * - Writes <name>.png next to each <name>.html (deviceScaleFactor 2, full page).
 * - Writes _index.html: a GRID gallery so all mockups sit side-by-side (the whole point
 *   of the method is comparison — never make the user scroll between options one at a time).
 * - Picks a FREE port, spawns a detached static server, prints the URLs, and exits.
 *
 * Needs Playwright + Chromium. If missing, screenshots are SKIPPED but the gallery is
 * still served (open it and screenshot by hand). Install with:
 *   npm i -D playwright && npx playwright install chromium
 */
import { readdirSync, writeFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, resolve, basename, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawn, execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.woff2': 'font/woff2',
}

// ---- detached server mode -------------------------------------------------
if (process.argv[2] === '--serve') {
  const dir = resolve(process.argv[3])
  const port = Number(process.argv[4]) || 8127
  const root = dir.endsWith(sep) ? dir : dir + sep
  const srv = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent((req.url || '/').split('?')[0])
      if (p === '/') p = '/_index.html'
      const file = resolve(join(dir, p))            // normalize: collapses any ../
      if (file !== dir && !file.startsWith(root)) { res.writeHead(403); return res.end() }
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
      res.end(body)
    } catch { res.writeHead(404); res.end('not found') }
  })
  // EADDRINUSE etc. are emitted async, not thrown — surface them instead of dying silently.
  srv.on('error', (e) => { process.stderr.write('serve-and-shoot: server error — ' + e.message + '\n'); process.exit(1) })
  srv.listen(port, '127.0.0.1')
} else {
  await main()
}

// ---- main: screenshot + gallery + spawn server ----------------------------
async function main() {
  const dir = resolve(process.argv[2] || '.')
  const argPort = Number(process.argv[3]) || 0
  const width = Number(process.argv[4]) || 1280
  if (!safeIsDir(dir)) { console.error(`not a directory: ${dir}`); process.exit(1) }

  const htmls = readdirSync(dir)
    .filter((f) => f.endsWith('.html') && f !== '_index.html')
    .sort()
  if (!htmls.length) { console.error(`no .html mockups in ${dir}`); process.exit(1) }

  // Screenshots are best-effort: skipped gracefully if Playwright is missing, and each
  // mockup is shot on its OWN page inside its OWN try/catch so one bad mockup can't
  // contaminate the next shot or abort the whole batch.
  const chromium = await loadChromium()
  let shot = 0
  const failed = []
  if (chromium) {
    const browser = await chromium.launch()
    for (const f of htmls) {
      const page = await browser.newPage({ deviceScaleFactor: 2 })
      try {
        await page.setViewportSize({ width, height: 900 })
        const url = pathToFileURL(join(dir, f)).href
        try { await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }) }
        catch { await page.goto(url, { waitUntil: 'load', timeout: 15000 }) }
        await page.waitForTimeout(900) // fonts + any JS-drawn content
        await page.screenshot({ path: join(dir, f.replace(/\.html$/, '.png')), fullPage: true })
        shot++
        console.log('shot', f)
      } catch (e) {
        failed.push(f)
        console.error('FAILED', f, '—', e.message)
      } finally {
        await page.close().catch(() => {})
      }
    }
    await browser.close()
  } else {
    console.error('Playwright/Chromium not found — skipping screenshots (gallery still served).')
    console.error('Install with: npm i -D playwright && npx playwright install chromium')
  }

  writeFileSync(join(dir, '_index.html'), gallery(htmls, width))

  // spawn detached static server on a FREE port so this process can exit
  const port = argPort || (await findFreePort(8127))
  const srv = spawn(process.execPath, [__filename, '--serve', dir, String(port)], { detached: true, stdio: 'ignore' })
  srv.unref()

  console.log('\n— gacha-ui gallery —')
  console.log(`browse all:  http://localhost:${port}/_index.html`)
  for (const f of htmls) console.log(`  http://localhost:${port}/${f}`)
  if (failed.length) console.log(`\n(${failed.length} screenshot(s) failed: ${failed.join(', ')} — still served)`)
  const killHint = process.platform === 'win32'
    ? `netstat -ano | findstr :${port}  then  taskkill /PID <pid> /F`
    : `lsof -ti tcp:${port} | xargs kill`
  console.log(`\n(${shot} screenshot(s) written; server runs detached on :${port} — kill with: ${killHint})`)
  process.exit(0)
}

function safeIsDir(p) { try { return statSync(p).isDirectory() } catch { return false } }

// Scan upward from `start` for a port nothing is listening on; fall back to `start`.
function findFreePort(start) {
  return new Promise((res) => {
    let p = start
    const tryPort = () => {
      const s = createServer()
      s.once('error', () => { if (p < start + 50) { p++; tryPort() } else res(start) })
      s.once('listening', () => s.close(() => res(p)))
      s.listen(p, '127.0.0.1')
    }
    tryPort()
  })
}

async function loadChromium() {
  // 1) cwd node_modules / NODE_PATH
  for (const name of ['playwright', 'playwright-core']) {
    try { const m = await import(name); const c = m.chromium ?? m.default?.chromium; if (c) return c } catch {}
  }
  // 2) global npm root
  try {
    const groot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    for (const name of ['playwright', 'playwright-core']) {
      try { const m = await import(join(groot, name, 'index.js')); const c = m.chromium ?? m.default?.chromium; if (c) return c } catch {}
    }
  } catch {}
  return null
}

function gallery(htmls, width) {
  const items = htmls.map((f) => {
    const name = basename(f, '.html')
    return `    <figure class="item">
      <figcaption><a href="${f}" target="_blank">${name}</a></figcaption>
      <div class="stage"><iframe src="${f}" scrolling="no"></iframe></div>
    </figure>`
  }).join('\n')
  // Live HTML scaled to fit each cell — NOT a fixed-height iframe that clips.
  // Each mockup is rendered at its real screenshot width, then CSS-scaled to the cell,
  // so fixed-size frames (e.g. 1920×1080) AND tall pages both show in full at true aspect.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>gacha-ui · ${htmls.length} mockups</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#06080d;color:#e8eef7;font:15px/1.5 -apple-system,"PingFang SC",system-ui,sans-serif;padding:26px 30px}
  h1{font-size:17px;font-weight:700;margin:0 0 18px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(560px,1fr));gap:20px}
  .item{margin:0;border:1px solid rgba(255,255,255,.10);border-radius:14px;overflow:hidden;background:#0a0e16}
  figcaption{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06);font-weight:600}
  figcaption a{color:inherit;text-decoration:none}
  .stage{position:relative;width:100%;overflow:hidden;background:#000}
  .stage iframe{border:0;transform-origin:top left;display:block;background:#0a0e16}
</style></head><body>
<h1>gacha-ui · ${htmls.length} mockups — side-by-side (live HTML, scaled to fit). Pick a winner (or "winner + worst", or mix).</h1>
<div class="grid">
${items}
</div>
<script>
  var RENDER_W = ${width};
  function fit(){
    document.querySelectorAll('.stage').forEach(function(s){
      var f = s.querySelector('iframe');
      var scale = s.clientWidth / RENDER_W;
      var h = 0;
      try { var d = f.contentDocument; h = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0); } catch (e) {}
      if (!h) h = RENDER_W * 9 / 16; // fallback aspect if content height unreadable
      f.style.width = RENDER_W + 'px';
      f.style.height = h + 'px';
      f.style.transform = 'scale(' + scale + ')';
      s.style.height = (h * scale) + 'px';
    });
  }
  addEventListener('resize', fit);
  addEventListener('load', fit);
  document.querySelectorAll('.stage iframe').forEach(function (f) { f.addEventListener('load', fit); });
  fit();
  setTimeout(fit, 400); // re-fit after fonts / late layout
</script>
</body></html>`
}
