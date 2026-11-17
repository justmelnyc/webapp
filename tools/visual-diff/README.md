# Visual diff

Compares the rewrite against the original app pixel by pixel. The rewrite's whole purpose is to
preserve the original's design, so use this before calling any UI work done.

## Setup

Run all three at once:

```bash
# 1. the mock API (this repo)
yarn mock                                   # :7770

# 2. the rewrite (this repo)
yarn dev -p 6661                            # :6661   (use `npx next dev -p 6661`)

# 3. the ORIGINAL app, from a checkout of the old branch (React 15 + Webpack 3)
cd ../webapp                                # branch feat/mock-api
NODE_OPTIONS=--openssl-legacy-provider npx babel-node src/server/dev.js   # :6660
```

Both apps read the same mock, so the data is identical: any visual difference is a design difference.
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
| `--probe ".a\|.b"` | print computed styles and boxes of each selector on both sides, only where they differ |
| `--dump ".sel"` | print each side's outerHTML (to learn the original's DOM) |
| `--click ".sel"` | click an element on both sides before capturing (open menus, the omnibar) |

Natively lazy-loaded images are forced to load before the capture, and animations are frozen.
