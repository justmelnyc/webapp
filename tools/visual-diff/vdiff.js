#!/usr/bin/env node
// Visual diff: the original app (http://localhost:6660) vs the rewrite (http://localhost:6661).
// See README.md in this folder.
//
//   node tools/visual-diff/vdiff.js --path /discover [--width 1280] [--vh 900] [--maxh 3000]
//        [--login ada] [--wait 8000] [--port 9333] [--out DIR]
//        [--probe ".a|.b"] [--dump ".sel"] [--click ".sel"] [--clickwait ms] [--until ".sel"] [--type "#id=value"]
//        [--eval "js"] [--click2 ".sel"] [--afterwait ms]
//
// Writes legacy.png, new.png, diff.png (differences in red) and side.png (original left, rewrite
// right) into --out and prints the percentage of mismatching pixels.
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')
const os = require('os')
const path = require('path')
const WebSocket = require('ws')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]] : acc), []))
const PATH = args.path || '/'
const WIDTH = +args.width || 1280
const MAXH = +args.maxh || 2400
const PORT = +args.port || 9300 + Math.floor(Math.random() * 600) // random: a run must never attach to the previous run's dying Chrome
const WAIT = +args.wait || 5000
const OUT = args.out || path.join(os.tmpdir(), 'vdiff-out')
const SIDES = { legacy: 'http://localhost:6660', new: 'http://localhost:6661' }
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const getJson = (url) => new Promise((res, rej) => http.get(url, (r) => { let d = ''; r.on('data', (c) => { d += c }); r.on('end', () => res(JSON.parse(d))) }).on('error', rej))

const STYLE_KEYS = ['display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'color', 'backgroundColor', 'width', 'height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTop', 'borderBottom', 'borderRadius', 'opacity', 'textAlign', 'gap']

// Each run gets a throwaway Chrome profile. Remove it on every exit path (and sweep any left behind by
// runs that were killed), otherwise they pile up in the temp dir at tens of MB each.
const sweepStaleProfiles = () => {
  try {
    for (const name of fs.readdirSync(os.tmpdir())) {
      const dir = path.join(os.tmpdir(), name)
      if (name.startsWith('vd-') && Date.now() - fs.statSync(dir).mtimeMs > 60 * 60 * 1000) fs.rmSync(dir, { recursive: true, force: true })
    }
  } catch { /* best effort */ }
}
sweepStaleProfiles()
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'vd-'))
let chromeProc = null
process.on('exit', () => {
  try { if (chromeProc) chromeProc.kill() } catch { /* already gone */ }
  try { fs.rmSync(PROFILE, { recursive: true, force: true }) } catch { /* best effort */ }
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(130))

const connect = async () => {
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, 'about:blank'], { stdio: 'ignore' })
  for (let i = 0; i < 40; i += 1) { try { await getJson(`http://127.0.0.1:${PORT}/json/version`); break } catch { await wait(250) } }
  const target = (await getJson(`http://127.0.0.1:${PORT}/json/list`)).find((t) => t.type === 'page')
  chromeProc = proc
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => ws.on('open', r))
  let id = 0
  const pending = {}
  ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pending[x.id]) { pending[x.id](x); delete pending[x.id] } })
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending[i] = res; ws.send(JSON.stringify({ id: i, method, params })) })
  const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result.value
  return { proc, send, ev, ws }
}

const FREEZE = `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}nextjs-portal,[data-nextjs-toast]{display:none!important}`

const login = async (c, base, user) => {
  await c.send('Page.navigate', { url: `${base}/enter` })
  for (let i = 0; i < 80; i += 1) { if (await c.ev(`!!document.querySelector('input[name="user[usernameOrEmail]"], #usernameOrEmail')`)) break; await wait(250) }
  await wait(1500)
  await c.ev(`(() => { const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) }
    set(document.querySelector('input[name="user[usernameOrEmail]"], #usernameOrEmail'), '${user}@example.com'); set(document.querySelector('input[type=password]'), 'password') })()`)
  await wait(1500)
  await c.ev(`[...document.querySelectorAll('button')].find(b => /log ?in|enter/i.test(b.textContent)).click()`)
  await wait(6000)
}

// --reset-email ada@example.com: every side gets its own fresh password reset token in place of `{token}` in --path
// (a token works once, so the two apps cannot share one).
const resetPath = async (email) => {
  const mock = process.env.MOCK_URL || 'http://localhost:7770'
  await fetch(`${mock}/api/v2/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
  const { token } = await (await fetch(`${mock}/mock/last-reset-link`)).json()
  return PATH.replace('{token}', token)
}

const capture = async (c, base, label) => {
  await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: WIDTH < 600 })
  await c.send('Page.navigate', { url: base + (args['reset-email'] ? await resetPath(args['reset-email']) : PATH) })
  await wait(WAIT)
  await c.ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(FREEZE)}; document.head.appendChild(s) })()`)
  if (args.type) {
    const [sel, ...rest] = String(args.type).split('=')
    await c.ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(rest.join('='))}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) })()`)
    await wait(2500)
  }
  // --click "a >> b": click several elements in turn (e.g. switch to list view, then open the repost editor)
  if (args.click) { for (const sel of String(args.click).split(' >> ')) { await c.ev(`document.querySelector(${JSON.stringify(sel)}) && document.querySelector(${JSON.stringify(sel)}).click()`); await wait(+args.clickwait || 1500) }
    // --until ".sel": keep waiting (up to 15s) for something that loads late after the click
    if (args.until) for (let i = 0; i < 60 && !(await c.ev(`!!document.querySelector(${JSON.stringify(args.until)})`)); i += 1) await wait(250)
    if (args.until) await wait(500)
    // the original scrolls the opened editor into view after 0.5-1s; capture from the top like a fresh load
    await wait(1200); await c.ev('window.scrollTo(0, 0)'); await wait(1500) }
  // --eval "js": run JS on both sides after the clicks (e.g. type into the editor); --click2 "a >> b": click again afterwards
  if (args.eval) {
    await c.ev(String(args.eval)); await wait(1500)
    if (args.click2) { for (const sel of String(args.click2).split(' >> ')) { await c.ev(`document.querySelector(${JSON.stringify(sel)}) && document.querySelector(${JSON.stringify(sel)}).click()`); await wait(+args.clickwait || 1500) }
      await wait(+args.afterwait || 1500); await c.ev('window.scrollTo(0, 0)'); await wait(1000) }
  }
  // Fetch natively lazy-loaded images without scrolling (scrolling would trigger infinite scroll).
  await c.ev(`document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager' })`)
  await c.ev(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000) })))`)
  await wait(600)
  await c.ev('window.scrollTo(0, 0)'); await wait(1500)
  const full = await c.ev('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)')
  const height = Math.min(full, MAXH)
  const VH = +args.vh || 0
  await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: VH || height, deviceScaleFactor: 1, mobile: WIDTH < 600 })
  await wait(700)
  await c.ev('window.scrollTo(0, 0)'); await wait(1500)
  const full2 = VH ? await c.ev('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)') : 0
  const shot = VH ? await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: Math.min(full2, MAXH), scale: 1 } }) : await c.send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(path.join(OUT, `${label}.png`), Buffer.from(shot.result.data, 'base64'))
  let probes = null
  if (args.probe) {
    probes = await c.ev(`(() => { const keys = ${JSON.stringify(STYLE_KEYS)}; const out = {}
      for (const sel of ${JSON.stringify(String(args.probe).split('|'))}) { const el = document.querySelector(sel); if (!el) { out[sel] = null; continue }
        const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
        for (const k of keys) o[k] = cs[k]; out[sel] = o } return out })()`)
  }
  let dumps = null
  if (args.dump) {
    dumps = await c.ev(`(() => { const out = {}; for (const sel of ${JSON.stringify(String(args.dump).split('|'))}) { const el = document.querySelector(sel); out[sel] = el ? el.outerHTML.replace(/ (data-[a-z-]+|style)="[^"]*"/g, '').replace(/<svg[\\s\\S]*?<\\/svg>/g, '<svg…/>').slice(0, ${+args.dumplen || 3500}) : null } return out })()`)
  }
  return { height: full, probes, dumps }
}

const pad = (png, w, h) => { const out = new PNG({ width: w, height: h }); out.data.fill(255); PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0); return out }

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const c = await connect()
  await c.send('Page.enable'); await c.send('Runtime.enable')
  await c.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  const results = {}
  for (const [label, base] of Object.entries(SIDES)) {
    if (args.login) await login(c, base, args.login)
    results[label] = await capture(c, base, label)
  }
  const a = PNG.sync.read(fs.readFileSync(path.join(OUT, 'legacy.png')))
  const b = PNG.sync.read(fs.readFileSync(path.join(OUT, 'new.png')))
  const w = Math.max(a.width, b.width); const h = Math.max(a.height, b.height)
  const pa = pad(a, w, h); const pb = pad(b, w, h); const diff = new PNG({ width: w, height: h })
  const bad = pixelmatch(pa.data, pb.data, diff.data, w, h, { threshold: 0.12 })
  fs.writeFileSync(path.join(OUT, 'diff.png'), PNG.sync.write(diff))
  const side = new PNG({ width: w * 2 + 10, height: h }); side.data.fill(180)
  PNG.bitblt(pa, side, 0, 0, w, h, 0, 0); PNG.bitblt(pb, side, 0, 0, w, h, w + 10, 0)
  fs.writeFileSync(path.join(OUT, 'side.png'), PNG.sync.write(side))
  console.log(`path=${PATH} width=${WIDTH} legacy=${a.width}x${a.height} (page ${results.legacy.height}px) new=${b.width}x${b.height} (page ${results.new.height}px)`)
  console.log(`mismatch: ${((bad / (w * h)) * 100).toFixed(1)}% of pixels   -> ${OUT}/{legacy,new,diff,side}.png`)
  if (args.probe) {
    for (const sel of String(args.probe).split('|')) {
      const l = results.legacy.probes[sel]; const n = results.new.probes[sel]
      console.log(`\n[${sel}]`)
      if (!l || !n) { console.log(`  legacy: ${l ? 'found' : 'MISSING'}   new: ${n ? 'found' : 'MISSING'}`); if (l) console.log('  legacy ' + JSON.stringify(l)); continue }
      for (const k of ['rect', ...STYLE_KEYS]) { const lv = JSON.stringify(l[k]); const nv = JSON.stringify(n[k]); if (lv !== nv) console.log(`  ${k}: legacy=${lv}  new=${nv}`) }
    }
  }
  if (args.dump) {
    for (const sel of String(args.dump).split('|')) {
      console.log(`\n[dump ${sel}]`)
      console.log('  legacy: ' + (results.legacy.dumps[sel] || 'MISSING'))
      console.log('  new:    ' + (results.new.dumps[sel] || 'MISSING'))
    }
  }
  c.ws.close(); c.proc.kill(); process.exit(0)
})().catch((e) => { console.error('VDIFF ERROR', e); process.exit(2) })
