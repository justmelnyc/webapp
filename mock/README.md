# Mock Ello API

The real Ello API is gone, so this server stands in for it during development.

```bash
yarn mock          # http://localhost:7770 (set AUTH_DOMAIN to this in .env)
yarn dev           # the app on :6660 proxies /api to the mock
yarn mock:reset    # delete mock/.data and start over from the seed data
```

## Logging in

Log in at `/enter` with any seeded user's email or username and **any password of 8+ characters** (e.g. `password`; the form keeps the button disabled for shorter ones):
`ada@example.com` (default, follows everyone), `grace`, `mara`, `jules`, `theo`, `noor`, `ines`, `kofi`, `saoirse`, `luca`, `yuki`, `amara`.
Unknown users get a 401. Signup is not mocked.

## What works

| Area | Behavior |
|---|---|
| Media upload | The editor's image upload, avatar and header upload all work. The mock acts as the S3 target (`/mock-s3`); files are saved to `mock/.data/uploads` and served back. |
| Posts | Create, edit and delete posts (text and images). They show up in Following, your profile and category streams. |
| Social | Love, watch, comment (edit/delete own), follow/unfollow. Counts are computed live. |
| Profile | Name, bio, location, links, avatar, cover and the preference toggles on `/settings`. |
| Streams | Cursor pagination (12 per page), trending vs recent, per-user and per-category filtering, user search. |
| Data | 12 users, 48 seeded posts with comments and loves. Everything persists to `mock/.data/db.json`. |

Not mocked: signup, password reset, invitations, notifications (always empty), artist invites. Unmocked REST calls are logged with `!!` and return `{}`.

## Images

Avatars are real face photos from [pravatar.cc](https://pravatar.cc) and photos/covers come from [picsum.photos](https://picsum.photos), both seeded by username so they stay stable. Only fake usernames are sent. Set `MOCK_OFFLINE=1` to use generated SVG placeholders from this server instead.

## Layout

```
server.js        wiring: CORS, logging, routes
db.js seed.js    persisted store and deterministic seed data
serialize.js     records -> GraphQL (v3) and v2 shapes the reducers expect
content.js       categories, page headers, editorials
settings.js      /settings preference toggles
media.js         image URL builders
routes/          auth, upload (S3), graphql, rest (reads), mutations (writes), media
```
