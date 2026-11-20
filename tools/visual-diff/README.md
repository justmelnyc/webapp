# Visual diff

Compares the rewrite against the original app pixel by pixel. The rewrite's whole purpose is to
preserve the original's design, so use this before calling any UI work done.

## Setup

Run all three at once:

```bash
# 1. the mock API (this repo), in STATIC mode
yarn mock:static                            # :7770   (MOCK_LIVE=0: no background activity, no latency)

# 2. the rewrite (this repo)
yarn dev -p 6661                            # :6661   (use `npx next dev -p 6661`)

# 3. the ORIGINAL app, from a checkout of the old branch (React 15 + Webpack 3)
cd ../webapp                                # branch feat/mock-api
NODE_OPTIONS=--openssl-legacy-provider npx babel-node src/server/dev.js   # :6660
```

Both apps read the same mock, so the data is identical: any visual difference is a design difference.
That only holds in static mode. Plain `yarn mock` is live: seeded people post, love and comment on their own
and answers are delayed a little, so the two captures (taken one after the other) would see different data.
`curl localhost:7770/mock/live` says which mode is running (`"enabled": false` is static).
Seed dates are relative to when the database was created, so relative times ("3h") can tick over between the
two captures now and then; run it again if a diff is only a timestamp. Post tokens are the same on every
fresh database (list them from `mock/.data/db.json`).
Each run uses a throwaway Chrome profile that is removed when it exits (stale ones older than an hour are swept at startup).
Needs Google Chrome (macOS path in the script; edit `CHROME` for other systems).

## Use

```bash
node tools/visual-diff/vdiff.js --path /discover --width 1280 --out /tmp/vd
node tools/visual-diff/vdiff.js --path /ada --width 375 --login ada --out /tmp/vd
```

Open `/tmp/vd/side.png` (original left, rewrite right) and `diff.png` (differences in red). The
script prints the mismatch percentage; matching pages are 0.0%.

| Option | |
|---|---|
| `--width` | viewport width (1280 desktop, 375 mobile; also check 700 and 1000) |
| `--vh` | fixed viewport height; set it (900) for pages with `100vh` heroes |
| `--maxh` | cap on the captured page height |
| `--login ada` | log both apps in first (any seeded user; password is filled in) |
| `--probe ".a\|.b"` | print computed styles and boxes of each selector (first visible match) on both sides, only where they differ |
| `--dump ".sel"` | print each side's outerHTML (to learn the original's DOM) |
| `--click ".sel"` | click an element on both sides before capturing (open menus, the omnibar) |
| `--eval "js"` / `--click2 ".sel"` / `--afterwait ms` | run JS on both sides after the clicks (e.g. type into the editor), then click again (e.g. Post) |
| `--reset-email e@x` | give each side a fresh password reset token, put it where `{token}` is in `--path` (tokens work once) |
| `--type "#id=value"` | set an input's value on both sides (fires input/change) and wait 2.5s, e.g. for the availability check |
| `--snap ms` | capture the viewport that long after the last action (the load, the last `--click`, the `--eval`, or the last `--click2`) instead of waiting for the page to settle: what each app draws while a request is still out (see below) |
| `--legacy-origin` / `--new-origin` / `--mock` | where the two apps and the mock run when it is not :6660 / :6661 / :7770 (a private stack) |

Natively lazy-loaded images are forced to load before the capture, and animations are frozen.

## Loading states

With an instant mock a request is over before anything can be captured. `POST /mock/latency?ms=6000` makes every
API answer wait that long from then on (`POST /mock/latency` without `ms` clears it; works in static mode), and
`--snap` captures at a fixed moment after the last action. Set the delay from the page itself, so logging in and
the first load stay fast, and clear it again just before the capture so the other side can log in:

```bash
node tools/visual-diff/vdiff.js --path /discover --login ada --vh 900 --snap 1500 --eval "(async () => {
  const M = 'http://localhost:7770/mock/latency'
  await fetch(M + '?ms=6000', { method: 'POST' })             // every answer now takes 6s
  setTimeout(() => fetch(M, { method: 'POST' }), 1200)         // back to normal before the capture
  ;[...document.querySelectorAll('.NavbarLink')].find((a) => /Following/.test(a.textContent)).click()
})()"
```

Only the viewport is captured (`--vh`, default 900) and nothing is scrolled or resized first. Animations are frozen
at their first frame, so a spinner is a still mark and the paginator's gradient does not move. Pictures are not
waited for: a capture taken while pravatar / picsum are still answering differs in those boxes. Do this on a
private stack (`MOCK_PORT=7771 MOCK_DATA_DIR=...`, a second `next dev` in a copy of the tree with
`API_ORIGIN=http://localhost:7771`, a copy of the original with `AUTH_DOMAIN` / `API_DOMAIN` and the port in
`src/server/dev.js` changed), not the shared one: a delay on the shared mock slows everybody else's diffs.
