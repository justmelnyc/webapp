#!/usr/bin/env node
// Visual diff: the original app (http://localhost:6660) vs the rewrite (http://localhost:6661).
// See README.md in this folder.
//
//   node tools/visual-diff/vdiff.js --path /discover [--width 1280] [--vh 900] [--maxh 3000]
//        [--login ada] [--wait 8000] [--port 9333] [--out DIR]
//        [--probe ".a|.b"] [--dump ".sel"] [--click ".sel"]
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
const PORT = +args.port || 9333
const WAIT = +args.wait || 5000
const OUT = args.out || path.join(os.tmpdir(), 'vdiff-out')
const SIDES = { legacy: 'http://localhost:6660', new: 'http://localhost:6661' }
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const getJson = (url) => new Promise((res, rej) => http.get(url, (r) => { let d = ''; r.on('data', (c) => { d += c }); r.on('end', () => res(JSON.parse(d))) }).on('error', rej))

const STYLE_KEYS = ['display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'color', 'backgroundColor', 'width', 'height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTop', 'borderBottom', 'borderRadius', 'opacity', 'textAlign', 'gap']

const connect = async () => {
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${fs.mkdtempSync(path.join(os.tmpdir(), 'vd-'))}`, 'about:blank'], { stdio: 'ignore' })
  for (let i = 0; i < 40; i += 1) { try { await getJson(`http://127.0.0.1:${PORT}/json/version`); break } catch { await wait(250) } }
  const target = (await getJson(`http://127.0.0.1:${PORT}/json/list`)).find((t) => t.type === 'page')
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

const capture = async (c, base, label) => {
  await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: WIDTH < 600 })
  await c.send('Page.navigate', { url: base + PATH })
  await wait(WAIT)
  await c.ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(FREEZE)}; document.head.appendChild(s) })()`)
  if (args.click) { await c.ev(`document.querySelector(${JSON.stringify(args.click)}) && document.querySelector(${JSON.stringify(args.click)}).click()`); await wait(1500) }
  // Fetch natively lazy-loaded images without scrolling (scrolling would trigger infinite scroll).
  await c.ev(`document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager' })`)
  await c.ev(`Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000) })))`)
  await wait(600)
  const full = await c.ev('Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)')
  const height = Math.min(full, MAXH)
  const VH = +args.vh || 0
  await c.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: VH || height, deviceScaleFactor: 1, mobile: WIDTH < 600 })
  await wait(700)
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
