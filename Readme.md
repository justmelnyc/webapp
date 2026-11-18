<img src="http://d324imu86q1bqn.cloudfront.net/uploads/user/avatar/641/large_Ello.1000x1000.png" width="200px" height="200px" />

# Ello Web Application

[![Build Status](https://travis-ci.org/ello/webapp.svg?branch=master)](https://travis-ci.org/ello/webapp)

The web app for [ello.co](http://ello.co).

## Running locally

The Ello API is not public, so the repo ships a mock (`mock/`, see [mock/README.md](mock/README.md)).

```bash
nvm use                      # Node 20 (see .nvmrc)
yarn install
cp .env.example .env.local   # API_ORIGIN=http://localhost:7770
yarn mock                    # terminal 1: mock API on :7770
yarn dev                     # terminal 2: the app on http://localhost:6660
```

Log in at `/enter` as `ada@example.com` with any password of 8+ characters.

| Command | |
|---|---|
| `yarn dev` / `yarn build` / `yarn start` | Next.js dev server, production build, serve the build |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | ESLint (Next + TypeScript rules) |
| `yarn test` | Jest + React Testing Library |

## Stack

Next.js (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query (infinite feeds) ·
Zustand (composer draft, toasts) · React Hook Form + Zod (forms, and validation of every API response).

- Server Components read the API with the session token from an httpOnly cookie (`lib/api`, `services/`).
- Mutations are Server Actions (`actions/`); optimistic UI uses `useOptimistic`.
- Uploads go browser → storage directly with credentials from the API (`lib/client/upload.ts`).
- `legacy/` holds the previous React 15 / Redux / Webpack app, kept only for reference while features are ported.

## Design fidelity

The point of the rewrite is to keep the original design. Its tokens and base styles live in
`app/styles/` (ported from `legacy/src/styles/jso.js` and `legacy/src/lib/styles/`), the icon set in
`components/icons/`, and every page was checked against the running original with a pixel diff.
Before calling UI work done, run `tools/visual-diff` (see its README): matching pages are 0.0%.

## Code of Conduct
Ello was created by idealists who believe that the essential nature of all human beings is to be kind, considerate, helpful, intelligent, responsible, and respectful of others. To that end, we will be enforcing [the Ello rules](https://ello.co/wtf/policies/rules/) within all of our open source projects. If you don’t follow the rules, you risk being ignored, banned, or reported for abuse.

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/ello/webapp.

## License
Ello Web Application is released under the [MIT License](/LICENSE.txt)

:metal::skull::metal:
:peace:

### Known intentional differences from the original
- **NSFW "View" button on feeds:** the original's GraphQL reducer drops `contentWarning`, so it never shows the button on `/discover/trending` or similar feeds. The rewrite shows it (about 5-15% diff on those pages when seeded NSFW posts are in the feed).
- **Profile hero diffs:** the hero is `100vh`; pass `--vh 900` to `tools/visual-diff/vdiff.js`.
- **Shop/embeds/reposts:** see `mock/README.md` for what the mock simulates.
- **Invites with no submissions:** the original treats the empty API answer as one blank submission and shows only a "Submissions" heading (a bug). The rewrite shows the zero state the original's code intended ("No Submissions Yet"), about 0.4% diff on `/invites/tiny-worlds`.
- **After resetting a password:** the original's saga signs in with the username from its (logged out, so empty) store, so nothing visibly happens and the form stays. The rewrite does what the saga meant to: signs in with the new password and goes to `/`. The mock's reset link is in its log and at `GET /mock/last-reset-link`.
- **Onboarding avatar "blank" check:** like the original, an avatar or header only counts as present when the profile says `hasAvatarPresent` / `hasCoverImagePresent` (the mock sets them once you upload one), so seeded users show the green upload buttons here.
