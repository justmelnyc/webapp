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
| Streams | Cursor pagination (12 per page), trending vs recent, per-user and per-category filtering, user search. Posts carry `categoryPosts` (one per `categoryIds` entry, status `featured` unless `db.categoryPostStates` says otherwise; curators of the category also get `actions` to feature / unfeature via `PUT /api/v2/category_posts/:id/(feature|unfeature)`, see `category-posts.js`: ada curates Art and Design, grace moderates Photography), which the original turns into the "@author in Category" header on the global feeds. |
| Moderation | Block/mute (`add/block`, `add/mute`, hidden from feeds), flags on posts/users/comments, Collab/Hire messages, per-user `isHireable`/`isCollaborateable`, community roles, NSFW posts (`contentWarning`). Seeded by a one-time migration of `db.json`. |
| Data | 12 users, 48 seeded posts with comments and loves. Everything persists to `mock/.data/db.json`. |

**Notifications** (`notifications.js`, `routes/notifications.js`): love, comment, comment/post mention, repost, watch and new-follower notifications. Loves, comments and follows are turned into notifications as they happen; the first start also seeds mentions, reposts and watches. Loading the feed marks it seen; a new notification lights the red dot on the next page change. `POST /mock/notifications/simulate` (with a bearer token) makes someone love the viewer's newest post. The original app reads REST (`GET /api/v2/notifications`), the rewrite reads GraphQL (`notificationStream`).

**Post search** (`post-search.js`, `routes/post-search.js`): the Posts tab of `/search`. Every term must match: a plain word is the start of a word in a post's text (or image alt text) or of the author's username; `#tag` matches one of the post's hashtags exactly. Newest first, offset-cursor paging. The original reads REST (`GET /api/v2/posts?terms=&per_page=25`, `Link` + `X-Total-*` headers), the rewrite reads GraphQL (`searchPosts(query, perPage, before)`). `#tags` in post text are served as `<span class="hashtag-link" data-href="/search?terms=%23tag">` (what the original's click handler expects). 30 posts with varied text and hashtags are seeded once, dated before the other seed posts so feeds keep their top.

More notification kinds: invitation accepted, artist invite submission accepted (yours and from people you follow), love/comment on your repost and on a repost of your post, category post featured and added as featured/curator/moderator, welcome (`notification-extras.js`; the first ones are derived from the data, the rest seeded once). The v2 feed pages like the real API (`page`, `per_page`, `Link`).

**Announcements** (`announcements.js`): one banner above the notifications, `GET /api/v2/most_recent_announcements` (204 when none), closed with `PATCH .../mark_last_read_announcement`. One is seeded; `POST /mock/announcements/simulate` (JSON: `header`, `body`, `ctaCaption`, `ctaHref`, `imageUrl`) publishes a new one for everyone.

**New Posts** (`new-posts.js`): `POST /mock/simulate-new-posts?count=2` (bearer token) makes people the viewer follows post right now. Like the original, a stream asks for its first page again whenever it opens: leave /following and come back and the navbar shows "New Posts".

Unmocked REST calls are logged with `!!` and return `{}`.

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

## Invitations and signup

`invitations.js` (pure logic, tested) and `routes/invitations.js`. Seeded for `ada`: two accepted invitations (grace, mara) and three pending ones; `/join/welcome1ad` is a pending code.

| Endpoint | Behavior |
|---|---|
| `GET /api/v2/invitations` | The viewer's invitations, newest first, with the users who accepted in `linked.users`. |
| `POST /api/v2/invitations` | `{email: [..]}` sends invitations; an address already invited (and not joined) is re-sent with the same code. |
| `POST /api/v2/invitations/:id/resend`, `DELETE /api/v2/invitations/:id` | Re-send or revoke a pending invitation. |
| `GET /api/v2/invitations/:code` | `{invitations: {email}}` (404 once used); how `/join/:code` prefills the form. |
| `POST /api/v2/signup` | `{email, username, password, invitation_code}` creates the user (scrypt hash), accepts the invitation and returns a token. 422 `{errors: {attrs}}` for taken names or short passwords. |

## Onboarding and password reset

`onboarding.js`, `resets.js`, `routes/onboarding.js`:

| Endpoint | Behavior |
|---|---|
| `PUT /api/v2/profile/followed_categories` | `{followed_category_ids, disable_follows}`: stores the ids on the user and (unless `disable_follows`) follows the five most active authors in those categories. |
| `PATCH /api/v2/profile` | `web_onboarding_version` is stored as sent (the app sends the string `'3'` when the creator type step is done; users who never onboarded report the number `3`). |
| `POST /api/v2/forgot-password` | `{email}`: always `200 {}`. For a known email it stores a one hour token, prints the link in the server log (`password reset link for ...`) and keeps it for the helper below. |
| `GET /mock/last-reset-link` | `{email, token, link, createdAt}` of the last link requested (404 before any). The link points at `MOCK_APP_ORIGIN` (default `http://localhost:6660`). |
| `PUT /api/v2/reset_password` | `{password, reset_password_token}`: sets the password (stored as a scrypt hash, so it is required at `/enter` afterwards) and burns the token; answers `{username}`. Unknown, used or expired tokens are 404, passwords outside 8-128 characters 422. |


## Artist invites

`artist-invites.js` (pure logic, tested: seed, visible streams, curator actions, pagination) and `routes/artist-invites.js`. Seven invites are seeded once (re-seeded when `SEED_VERSION` changes): three open (one hosted elsewhere through `redirectUrl`), one upcoming, one selecting and two closed, with guide text, header photos and generated logo SVGs (`/logos/:slug.svg`). Submissions reuse existing posts and have a status: `unapproved`, `approved`, `selected` (also listed as accepted) or `declined`. `ada` curates `neon-nights` and `type-for-the-people`.

| Endpoint | Behavior |
|---|---|
| `GET /api/v2/artist_invites` | Open first, then selecting, upcoming and closed. |
| `GET /api/v2/artist_invites/~slug` | Detail with `description`, `guide`, `submissionBodyBlock` and the `links` to the submission streams this viewer may read: curators get all four, visitors only accepted work (plus selections once closed), upcoming invites none. |
| `GET /api/v2/artist_invites/:id/:key_submissions` | 25 per page, `Link rel=next`, `X-Total-Pages`; submissions with `linked.posts/users/assets`, and curator `actions` for curators. |
| `PATCH /api/v2/artist_invite_submissions/:id/:action` | approve, decline, select, unapprove, unselect (curators only). |

Posting to an invite from the composer (`artist_invite_id`) creates an `unapproved` submission. GraphQL posts carry it as `artistInviteSubmission` (`id`, `status`, `artistInvite { id slug title }`, and the curator `actions` only for that invite's curators); posts that were not submitted return `null`. Deleting the post (`DELETE /api/v2/posts/:id`) removes its submission.
