# Mock Ello API

The real Ello API is gone, so this server stands in for it during development.

```bash
yarn mock          # http://localhost:7770, live: people post, love and comment while it runs
yarn mock:static   # the same data, but nothing happens on its own and nothing is delayed (for visual diffs)
yarn dev           # the Next.js app on :6660; it reads API_ORIGIN (default http://localhost:7770)
yarn mock:reset    # delete mock/.data and start over from the seed data
```

| Setting | |
|---|---|
| `MOCK_PORT` | port (default 7770) |
| `MOCK_DATA_DIR` | where the database and uploads live (default `mock/.data`). With `MOCK_PORT` this runs a second, separate instance: `MOCK_PORT=7771 MOCK_DATA_DIR=/tmp/mock2 yarn mock` |
| `MOCK_LIVE` | `0` = static mode (what `yarn mock:static` sets). `1` forces live mode on a database from the old seed |
| `MOCK_LIVE_INTERVAL` | average seconds between two things happening (default 20) |
| `MOCK_LIVE_MAX_POSTS`, `MOCK_LIVE_MAX_COMMENTS` | how much the background activity may add before its oldest posts / comments are removed again (200 / 600) |
| `MOCK_LATENCY` | average delay of an API answer in ms, live mode only (default 120, `0` = none) |
| `MOCK_OFFLINE` | `1` = generated placeholders instead of pravatar / picsum |

## A living site

**Time.** A fresh database is dated from the moment it is created (`db.seededAt`, `clock.js`): the newest post is a few minutes old, the first screens are minutes and hours apart, and the feed tapers off over about a month. Comments, reposts, invitations, artist invites (open / upcoming / closed) and the first notifications follow the same clock. Apart from that anchor the seed is deterministic: the same people, posts, tokens (`p0x1186`, ...), comments and loves every time. Not deterministic: the two reposts the notification seed adds on first use and anything made while running (their tokens contain the time). A database that has sat for weeks has simply aged; `yarn mock:reset` gives a fresh one.

**Background activity** (`live.js`, `live-runner.js`). While `yarn mock` runs, the seeded people act on their own about every 20 seconds: mostly loves and comments, now and then a new post, a follow or a repost. About a third of it is aimed at whoever is logged in (everyone seen in the last 30 minutes, else `ada`), so the notification dot lights up, "New Posts" appears on a stream you reopen, counts move and feeds change between visits. It all goes through the ordinary records, so both apps see it and notifications come from the usual `sync()`. Nobody acts as a logged-in user, as someone who signed up, or towards someone they blocked. With no requests for 10 minutes the pace drops to a sixth. Growth is capped (see the table above; loves and follows are bounded by people x posts). The server log shows each action (`live: @theo loved @ada's p37x5946`).

- `GET /mock/live`: settings, who counts as logged in, the last 30 actions.
- `POST /mock/live/step?count=5` (bearer token optional): make that many things happen now. Works in static mode too.
- `POST /mock/latency?ms=3000`: from now on every API answer waits exactly that long (static mode too); `POST /mock/latency` without `ms` goes back to the setting above. For capturing loading states at a known moment (`tools/visual-diff/README.md`). `GET /mock/live` reports it as `latency`.

**Latency** (`latency.js`). In live mode every API answer waits 0.4x to 1.6x `MOCK_LATENCY` (now and then three times that), so loading states show. Pictures, uploads and `/mock/*` are not delayed.

**Static mode** turns the last two off. **Visual diffing must use it** (`yarn mock:static`): the two apps are captured one after the other and have to see identical data. A database made by the old seed (no `seedVersion`) stays static by default.

## Logging in

Log in at `/enter` with any seeded user's email or username and **any password of 8+ characters** (e.g. `password`; the form keeps the button disabled for shorter ones):
`ada@example.com` (default, follows everyone), `grace`, `mara`, `jules`, `theo`, `noor`, `ines`, `kofi`, `saoirse`, `luca`, `yuki`, `amara`, and eighteen more (`people.js`: `dario`, `lena`, `omar`, `tessa`, `bao`, `wren`, `sol`, `priya`, `emeka`, `hana`, `felix`, `zadie`, `ravi`, `mio`, `caleb`, `anouk`, `idris`, `nell`).
Unknown users get a 401. New accounts are made with an invitation code (see [Invitations and signup](#invitations-and-signup)).

## What works

| Area | Behavior |
|---|---|
| Media upload | The editor's image upload, avatar and header upload all work. The mock acts as the S3 target (`/mock-s3`); files are saved to `mock/.data/uploads` and served back. |
| Posts | Create, edit and delete posts (text and images). They show up in Following, your profile and category streams. |
| Social | Love, watch, comment (edit/delete own), follow/unfollow. Counts are computed live. |
| Reposts | A repost is a post with `repostOfId` (`reposts.js`); `POST /api/v2/posts?repost_id=` creates one, `DELETE /api/v2/posts/:id/repost` removes it. Counts and `reposted` are derived; 16 are seeded (some bare, some with a note; the first five notes are the original five), plus the two the notification seed adds for ada and grace. |
| Profile | Name, bio, location, links, avatar, cover and the preference toggles on `/settings`. |
| Streams | Cursor pagination (12 per page), trending vs recent, per-user and per-category filtering, user search. Posts carry `categoryPosts` (one per `categoryIds` entry, status `featured` unless `db.categoryPostStates` says otherwise; curators of the category also get `actions` to feature / unfeature via `PUT /api/v2/category_posts/:id/(feature|unfeature)`, see `category-posts.js`: ada curates Art and Design, grace moderates Photography), which the original turns into the "@author in Category" header on the global feeds. |
| Related posts | `GET /api/v2/posts/:id/related?per_page=` (`:id` is an id or `~token`; `related-posts.js`, `routes/related-posts.js`): the stream under a post's page. The author's other posts first, then posts sharing a category, each newest first; never the post itself, never a repost, never someone the viewer blocked or muted. One page (`per_page`, default 6, at most 25; `X-Total-Pages-Remaining: 0`), in the v2 envelope with `linked.users` and `linked.assets`. The original renders the posts from it; the rewrite reads the tokens and loads the posts with `findPosts`. |
| Moderation | Block/mute (`add/block`, `add/mute`, hidden from feeds), flags on posts/users/comments, Collab/Hire messages, per-user `isHireable`/`isCollaborateable`, `blockedCount`/`mutedCount` on `GET /api/v2/profile` (above zero, both apps list the people from `GET /api/v2/profile/blocked|muted` on the settings page), community roles, NSFW posts (`contentWarning`). Seeded by a one-time migration of `db.json`. |
| Category roles | The curators and moderators of a category (`category-users.js`, `routes/category-users.js`, stored in `db.categoryRoles`). The GraphQL `category(slug)` query lists them as `categoryUsers(roles)` (`id`, `role`, `user`); `POST /api/v2/category_users` `{user_id, category_id, role}` adds one (answers `{categoryUsers, linked: {users}}`), `DELETE /api/v2/category_users/:id` removes one. Only people who hold a role in that category may do either (403 otherwise). `GET /api/v2/profile` reports those categories as `links.categories`, which is the list both apps read to decide who sees the add / remove buttons, and the subscribed categories as `followedCategoryIds`. The profile's "Community Roles" panel lists a user's roles from the same records (`categoryUsers` on `findUser`, ids `<categoryId>-<userId>-<role>`) plus their FEATURED roles, which live on the user (`user.roles`) because a featured user administers nothing. `profile-roles.js` serves the panel's administration: `searchCategories(administered: true)` answers with the categories the viewer holds a role in (`currentUserState.role`, the highest one; `query` filters by name), which is what makes both apps show the assign form, and the two REST endpoints also take `role: 'featured'` and ids ending in `-featured` (same permission: a role in that category). Known inconsistency: the seeded "added as curator / moderator" notifications (`notification-extras.js`) name roles that are not in `db.categoryRoles` (ada: curator of Photography, moderator of Design; grace: curator of Design, ...). The original keeps every `CategoryUser` it receives in one store, so once its notifications have loaded it lists those people on the category page too (ada on `/discover/photography` and `/discover/design`, grace on `/discover/design`); the rewrite lists what the `category` query returns. A category page's header (`pageHeaders(kind: CATEGORY, slug)`) carries its `category`, which is how the original knows the hero's category is subscribed. |
| Staff | `saoirse` is Ello staff (`staff.js`; `isStaff: true` on the user, put there once by a migration at startup, `db.staffSeed`, so it reaches an existing database as well as a fresh one; nothing else about her changes). `GET /api/v2/profile` reports `isStaff` and the login token `is_staff`. Staff may add and remove the roles of every category and every profile (`POST` / `DELETE /api/v2/category_users`, also `featured`), `searchCategories(administered: true)` answers them with all categories (`currentUserState.role` is null where they hold none; their `links.categories` stays empty), and they may delete anybody's comment. In the apps that is: the add / remove buttons on every category page, the Community Roles button and form (all three positions) on every profile, the x on every comment, and "Analytics" (`/manage`, which neither app serves) in the avatar menu. |
| Data | 30 people and about 310 posts (see [The seeded world](#the-seeded-world)). Everything persists to `mock/.data/db.json`. |

**Notifications** (`notifications.js`, `routes/notifications.js`): love, comment, comment/post mention, repost, watch and new-follower notifications. Loves, comments and follows are turned into notifications as they happen; the first start also seeds mentions, reposts and watches. Loading the feed marks it seen; a new notification lights the red dot on the next page change. `POST /mock/notifications/simulate` (with a bearer token) makes someone love the viewer's newest post. The original app reads REST (`GET /api/v2/notifications`), the rewrite reads GraphQL (`notificationStream`).

**Post search** (`post-search.js`, `routes/post-search.js`): the Posts tab of `/search`. Every term must match: a plain word is the start of a word in a post's text (or image alt text) or of the author's username; `#tag` matches one of the post's hashtags exactly. Newest first, offset-cursor paging. The original reads REST (`GET /api/v2/posts?terms=&per_page=25`, `Link` + `X-Total-*` headers), the rewrite reads GraphQL (`searchPosts(query, perPage, before)`). `#tags` in post text are served as `<span class="hashtag-link" data-href="/search?terms=%23tag">` (what the original's click handler expects). 30 posts with varied text and hashtags are seeded once (`srch*` tokens). A search that finds nothing answers `204 No Content` on the REST side, posts and people alike (`empty-list.js`): that is what gives the original its "Sorry, no results found." (with `200` and an empty list it draws one empty post instead). This follows the original's own handling of 204 as "an empty result"; the real API is gone, so it is an assumption.

More notification kinds: invitation accepted, artist invite submission accepted (yours and from people you follow), love/comment on your repost and on a repost of your post, category post featured and added as featured/curator/moderator, welcome (`notification-extras.js`; the first ones are derived from the data, the rest seeded once). The v2 feed pages like the real API (`page`, `per_page`, `Link`).

**Announcements** (`announcements.js`): one banner above the notifications, `GET /api/v2/most_recent_announcements` (204 when none), closed with `PATCH .../mark_last_read_announcement`. One is seeded; `POST /mock/announcements/simulate` (JSON: `header`, `body`, `ctaCaption`, `ctaHref`, `imageUrl`) publishes a new one for everyone.

**New Posts** (`new-posts.js`): `POST /mock/simulate-new-posts?count=2` (bearer token) makes people the viewer follows post right now. Like the original, a stream asks for its first page again whenever it opens: leave /following and come back and the navbar shows "New Posts".

**Paging across origins** (`cors.js`): the original asks for the first page of a REST stream through its own `/api` proxy and then follows `Link: rel="next"`, which names this server, so every further page is a cross-origin request. The mock therefore exposes `Link`, `X-Total-Pages`, `X-Total-Pages-Remaining` and `X-TotalCount` (`Access-Control-Expose-Headers`); without that the original cannot read them on page 2, takes it for the last page and never loads page 3 (which is how it behaved against this mock before).

Unmocked REST calls are logged with `!!` and return `{}`.

## The seeded world

`seed.js` puts it together from `people.js` (who), `world-posts.js` (what they posted), `world-social.js` (follows, comments, loves, reposts) and `copy-*.js` (what they wrote).

- **People:** 30, ids 1-30, the original twelve first. Bio, location and links for most; a mix of hireable / collaborateable; `caleb`, `idris` and `nell` have no avatar (they get `/img/default-avatar.svg`), seven have no cover, `caleb` has no bio. ada follows everyone; nine people follow ada, eight deliberately do not yet.
- **Posts:** 250 new ones (`p<n>x<4 digits>`) plus the older seeders' 10 shop, 3 embed and 30 search posts, and 16 reposts (`rp*`). Shapes: picture and caption, bare pictures, sets of 2-5, text only, long multi-paragraph texts, picture + text + link, embeds (YouTube, Vimeo, SoundCloud), work for sale (buy links on the pictures, listed under Shop), a few NSFW. Mentions are `<a href="/name" class="user-mention">` to real users; `#tags` find each other in search. Prolific people post more; no caption is used twice.
- **Reactions:** a long tail. Half the posts have no comment, a few have 20+; loves run from 0 to 27 and views from a dozen to 30,000. Threads include emoji reactions, questions to the author (with a mention), the author answering, and a few comments with a picture.
- **Category posts** (`category-posts.js`): per curator one `submitted` and one curator-`featured` post. The original app stores `featuredBy { username }` as a user without an id and then finds that empty record when it opens that person's profile, so the seed never lets a curator feature a post their own profile shows (their own, one they reposted, or the newest post of its author, which the notification seed reposts). `featured-by.test.js` holds that; databases seeded before it are repaired on the next start.

## Images

Avatars are real face photos from [pravatar.cc](https://pravatar.cc) and photos/covers come from [picsum.photos](https://picsum.photos), both seeded by username so they stay stable. Only fake usernames are sent. Set `MOCK_OFFLINE=1` to use generated SVG placeholders from this server instead.

**Video attachments** (`video.js`): an image region stored with `video: true` gets a `video` rendition on its asset, like an animated upload on the real API. Both apps then play the clip (muted, looping) in streams and show the still on the post page. The clip is `assets/loop.mp4`, two seconds of unchanging colour bars served from `/media/loop.mp4` by this server, so nothing else is fetched from outside and a capture shows the same frame whenever it is taken. Two posts are added at startup when none exist: `/mara/post/vid0x3000` (landscape) and `/jules/post/vid1x3011` (portrait).


## Layout

```
server.js        wiring: CORS (cors.js), logging, routes
db.js seed.js    persisted store and deterministic seed data (people.js, world-*.js, copy-*.js, clock.js)
live.js          background activity (pure); live-runner.js runs it on a timer; latency.js delays answers
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

`artist-invites.js` (pure logic, tested: seed, visible streams, curator actions, pagination) and `routes/artist-invites.js`. Seven invites are seeded once, dated from the database's creation (re-seeded when `SEED_VERSION` changes): three open (one hosted elsewhere through `redirectUrl`), one upcoming, one selecting and two closed, with guide text, header photos and generated logo SVGs (`/logos/:slug.svg`). Submissions reuse existing picture posts (spread over the feed) and have a status: `unapproved`, `approved`, `selected` (also listed as accepted) or `declined`. `ada` curates `neon-nights` and `type-for-the-people`.

| Endpoint | Behavior |
|---|---|
| `GET /api/v2/artist_invites` | Open first, then selecting, upcoming and closed. |
| `GET /api/v2/artist_invites/~slug` | Detail with `description`, `guide`, `submissionBodyBlock` and the `links` to the submission streams this viewer may read: curators get all four, visitors only accepted work (plus selections once closed), upcoming invites none. |
| `GET /api/v2/artist_invites/:id/:key_submissions` | 25 per page, `Link rel=next`, `X-Total-Pages`; submissions with `linked.posts/users/assets`, and curator `actions` for curators. |
| `PATCH /api/v2/artist_invite_submissions/:id/:action` | approve, decline, select, unapprove, unselect (curators only). |

Posting to an invite from the composer (`artist_invite_id`) creates an `unapproved` submission. GraphQL posts carry it as `artistInviteSubmission` (`id`, `status`, `artistInvite { id slug title }`, and the curator `actions` only for that invite's curators); posts that were not submitted return `null`. Deleting the post (`DELETE /api/v2/posts/:id`) removes its submission.
