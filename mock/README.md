# Mock Ello API

The real Ello API is gone, so this server stands in for it during development.

```bash
yarn mock          # http://localhost:7770
yarn dev           # the Next.js app on :6660; it reads API_ORIGIN (default http://localhost:7770)
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
| Reposts | A repost is a post with `repostOfId` (`reposts.js`); `POST /api/v2/posts?repost_id=` creates one, `DELETE /api/v2/posts/:id/repost` removes it. Counts and `reposted` are derived; 5 are seeded. |
| Profile | Name, bio, location, links, avatar, cover and the preference toggles on `/settings`. |
| Streams | Cursor pagination (12 per page), trending vs recent, per-user and per-category filtering, user search. |
| Moderation | Block/mute (`add/block`, `add/mute`, hidden from feeds), flags on posts/users/comments, Collab/Hire messages, per-user `isHireable`/`isCollaborateable`, community roles, NSFW posts (`contentWarning`). Seeded by a one-time migration of `db.json`. |
| Data | 12 users, 48 seeded posts with comments and loves. Everything persists to `mock/.data/db.json`. |

**Notifications** (`notifications.js`, `routes/notifications.js`): love, comment, comment/post mention, repost, watch and new-follower notifications. Loves, comments and follows are turned into notifications as they happen; the first start also seeds mentions, reposts and watches. Loading the feed marks it seen; a new notification lights the red dot on the next page change. `POST /mock/notifications/simulate` (with a bearer token) makes someone love the viewer's newest post. The original app reads REST (`GET /api/v2/notifications`), the rewrite reads GraphQL (`notificationStream`).

Not mocked: signup, password reset, invitations, artist invites. Unmocked REST calls are logged with `!!` and return `{}`.

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
moderation.js    block/mute, flags, availability, roles, NSFW seed (pure logic)
routes/          moderation (writes), auth, upload (S3), graphql, rest (reads), mutations (writes), media
```

## Account

`routes/account.js`, `credentials.js`, `passwords.js`, `export.js`:

| Endpoint | Behavior |
|---|---|
| `POST /api/v2/availability` | `{username}` or `{email}` -> `{availability: {username\|email: bool, suggestions}}`; usernames are case-insensitive, a few are reserved, your own counts as free. |
| `PATCH /api/v2/profile` | Changing username, email or password needs `current_password` (422 `{errors: {attrs: {current_password}}}` otherwise); duplicates and short passwords are 422 too. New passwords are stored as salted scrypt hashes and then required at `/enter`. Seeded users keep accepting any 8+ character password until they set one. |
| `POST /api/v2/profile/export` | Writes your profile, posts, comments, loves and follows to `mock/.data/exports/*.json` and returns `{exportUrl}` (`GET /exports/:name` downloads it). |
| `DELETE /api/v2/profile` | Deletes the user and their posts, comments, loves, watches and follows. |
